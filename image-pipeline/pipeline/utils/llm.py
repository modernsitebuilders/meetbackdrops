"""
OpenAI client wrapper with:
- Exponential backoff on rate-limit / server errors
- Strict JSON response parsing
- Shared client instance
"""
from __future__ import annotations

import json
import time
import logging
from typing import Any

from openai import OpenAI, RateLimitError, APIStatusError

from pipeline.config import Config

log = logging.getLogger(__name__)

# Retry config
_RETRY_STATUSES = {429, 500, 502, 503, 504}
_BASE_DELAY = 1.0
_MAX_DELAY = 60.0


def _backoff(attempt: int) -> float:
    return min(_BASE_DELAY * (2**attempt), _MAX_DELAY)


class LLMClient:
    def __init__(self, config: Config):
        self.cfg = config
        self._client = OpenAI(api_key=config.openai_api_key)

    def vision_analyze(self, image_url: str, asset_id: str) -> dict[str, Any]:
        """
        Send an image URL to GPT-4o and return strict vision JSON.
        Retries up to max_retries times with exponential backoff.
        """
        prompt = """Analyze this image and return ONLY valid JSON with exactly these fields:

{
  "scene_type": "string — e.g. office, nature, abstract, urban, domestic",
  "style": "string — e.g. minimalist, photorealistic, illustration, dark, bright",
  "objects": ["array", "of", "visible", "objects"],
  "colors": ["array", "of", "dominant", "colors"],
  "lighting": "string — e.g. natural daylight, warm artificial, dramatic, flat",
  "composition": "string — e.g. centered subject, rule of thirds, symmetrical, wide angle",
  "mood": "string — e.g. calm, energetic, professional, cozy, dramatic",
  "confidence": 0.95
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- Only describe what is VISUALLY PRESENT
- Do NOT generate titles, descriptions, or marketing copy
- confidence is your own estimate of analysis quality (0.0–1.0)"""

        for attempt in range(self.cfg.max_retries):
            try:
                response = self._client.chat.completions.create(
                    model=self.cfg.vision_model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "image_url", "image_url": {"url": image_url, "detail": "low"}},
                                {"type": "text", "text": prompt},
                            ],
                        }
                    ],
                    max_tokens=512,
                    temperature=0,
                    response_format={"type": "json_object"},
                )
                raw = response.choices[0].message.content
                parsed = json.loads(raw)
                parsed["raw_response"] = raw
                parsed["asset_id"] = asset_id
                return parsed

            except (RateLimitError, APIStatusError) as e:
                if attempt == self.cfg.max_retries - 1:
                    raise
                delay = _backoff(attempt)
                log.warning(f"Vision API error for {asset_id} (attempt {attempt+1}): {e}. Retrying in {delay}s")
                time.sleep(delay)

        raise RuntimeError(f"Vision analysis failed after {self.cfg.max_retries} attempts for {asset_id}")

    def generate_metadata(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Generate SEO metadata from vision data + cluster context.
        payload must contain: vision, cluster_id, base_name, variants (dict)
        """
        vision_str = json.dumps(payload["vision"], indent=2)
        cluster_id = payload.get("cluster_id", "unknown")
        base_name = payload.get("base_name", "")
        variants = payload.get("variants", {})
        variant_types = [k for k, v in variants.items() if v]

        prompt = f"""You are generating metadata for a stock photo / backdrop image.

VISION ANALYSIS (ground truth — do NOT contradict or invent):
{vision_str}

CLUSTER: {cluster_id}
BASE FILENAME: {base_name}
AVAILABLE VARIANTS: {', '.join(variant_types)}

Generate ONLY valid JSON with exactly these fields:

{{
  "title": "concise, descriptive title (max 70 chars)",
  "description": "2-3 sentence description for search engines, factual and descriptive",
  "alt": "brief alt text for screen readers (max 125 chars)",
  "keywords": ["array", "of", "15-25", "relevant", "keywords"],
  "seo_slug": "kebab-case-url-slug-from-title",
  "category": "single primary category from: nature, office, urban, abstract, lifestyle, food, technology, travel, architecture, other",
  "embedding_text": "dense descriptive sentence for semantic search embedding"
}}

Rules:
- ONLY describe what is in the vision data — never invent objects or scenes
- keywords must be relevant to actual visual content
- seo_slug must be URL-safe, lowercase, hyphenated
- embedding_text should be a rich, searchable sentence combining scene, mood, style, objects
- Return ONLY the JSON, no markdown"""

        for attempt in range(self.cfg.max_retries):
            try:
                response = self._client.chat.completions.create(
                    model=self.cfg.metadata_model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=800,
                    temperature=0.3,
                    response_format={"type": "json_object"},
                )
                raw = response.choices[0].message.content
                parsed = json.loads(raw)
                parsed["asset_id"] = payload["asset_id"]
                return parsed

            except (RateLimitError, APIStatusError) as e:
                if attempt == self.cfg.max_retries - 1:
                    raise
                delay = _backoff(attempt)
                log.warning(f"Metadata API error (attempt {attempt+1}): {e}. Retrying in {delay}s")
                time.sleep(delay)

        raise RuntimeError("Metadata generation failed after max retries")

    def name_cluster(self, cluster_visions: list[dict]) -> str:
        """
        Given a list of vision dicts for representative cluster members,
        return a snake_case cluster label slug.
        """
        summaries = [
            f"- scene: {v.get('scene_type')}, style: {v.get('style')}, "
            f"mood: {v.get('mood')}, objects: {', '.join(v.get('objects', [])[:5])}"
            for v in cluster_visions[:8]
        ]
        prompt = (
            "Based on these image descriptions, generate a single snake_case label "
            "that best describes this visual cluster (e.g. bright_minimal_office, "
            "dark_urban_street, warm_nature_forest).\n\n"
            + "\n".join(summaries)
            + "\n\nReturn ONLY the snake_case label, nothing else."
        )
        response = self._client.chat.completions.create(
            model=self.cfg.metadata_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20,
            temperature=0,
        )
        label = response.choices[0].message.content.strip().lower()
        # Sanitize: keep only alphanumeric + underscore
        import re
        label = re.sub(r"[^a-z0-9_]", "_", label)
        label = re.sub(r"_+", "_", label).strip("_")
        return label or f"cluster_{id}"
