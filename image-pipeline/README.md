# Image Metadata Pipeline

Production-ready 6-step pipeline for processing large R2/S3 image libraries
into structured, SEO-optimized metadata with visual clustering.

**Scales to 10,000+ images.**

---

## Architecture

```
R2 Bucket
    │
    ▼
┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐
│  INGEST  │ → │  ANALYZE  │ → │  EMBED   │ → │ CLUSTER  │ → │ METADATA │ → │ EXPORT  │
│ (Step 1) │   │ (Step 2)  │   │ (Step 3) │   │ (Step 4) │   │ (Step 5) │   │(Step 6) │
│          │   │           │   │          │   │          │   │          │   │         │
│ R2 list  │   │ GPT-4o    │   │ CLIP     │   │ UMAP +   │   │ GPT-4o   │   │ JSON +  │
│ → assets │   │ vision    │   │ local    │   │ HDBSCAN  │   │ mini     │   │ CSV     │
│ SQLite   │   │ SQLite    │   │ FAISS    │   │ SQLite   │   │ SQLite   │   │ files   │
└──────────┘   └───────────┘   └──────────┘   └──────────┘   └──────────┘   └─────────┘
```

All steps write to a single SQLite database (`outputs/pipeline.db`).
Every step is **idempotent** — safe to re-run. Failed assets are picked up
on the next run automatically.

---

## Quick Start

### 1. Install

```bash
cd image-pipeline
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your R2 credentials and OpenAI key
```

### 3. Run

```bash
# Full pipeline end-to-end
python cli.py run-all

# Or step by step
python cli.py ingest
python cli.py analyze
python cli.py embed
python cli.py cluster
python cli.py generate-metadata
python cli.py export

# Check current state
python cli.py status
```

---

## CLI Reference

| Command | Description | Key Options |
|---------|-------------|-------------|
| `ingest` | List R2, group into assets | `--prefix <key-prefix>` |
| `analyze` | GPT-4o vision per asset | `--workers 5`, `--force` |
| `embed` | CLIP embeddings (local) | `--force` |
| `cluster` | UMAP + HDBSCAN | `--no-llm-names` |
| `generate-metadata` | LLM SEO metadata | `--workers 8`, `--force` |
| `export` | JSON + CSV manifest | — |
| `run-all` | Full pipeline | all of the above |
| `status` | Progress summary | — |

---

## Output Files

```
outputs/
├── pipeline.db           # SQLite: all pipeline data (source of truth)
├── embeddings.faiss      # FAISS index for similarity search
├── embeddings_ids.npy    # asset_id lookup for FAISS results
├── manifest.json         # full nested manifest (10k assets ≈ 15MB)
├── manifest.csv          # flattened for CMS bulk import
└── clusters/
    ├── warm_coastal_golden_hour.json
    ├── bright_minimal_office.json
    └── ...
```

### manifest.json structure

```json
{
  "asset_id": "uuid",
  "base_name": "sunset-beach",
  "cluster_id": "uuid",
  "cluster_label": "warm_coastal_golden_hour",
  "variants": { "web": "url", "free": "url", "hd": "url" },
  "r2_keys":  { "web": "key", "free": "key", "hd": "key" },
  "vision":   { "scene_type", "style", "objects", "colors", "lighting", "composition", "mood", "confidence" },
  "metadata": { "title", "description", "alt", "keywords", "seo_slug", "category", "embedding_text" }
}
```

---

## Variant Detection

The ingest step groups R2 objects by detecting three variant types.
Detection priority:

1. **Folder prefix** — `hd/`, `free/`, `web/` folder in key path
2. **Filename suffix** — `-hd`, `-free`, `-premium`, etc.
3. **Extension fallback** — `.webp` → web, `.png` without suffix → free

Examples:
```
hd/sunset-beach.png      → hd variant,   base_name = "sunset-beach"
free/sunset-beach.png    → free variant,  base_name = "sunset-beach"
web/sunset-beach.webp    → web variant,   base_name = "sunset-beach"
sunset-beach-hd.png      → hd variant,   base_name = "sunset-beach"
sunset-beach.webp        → web variant,   base_name = "sunset-beach"
```

Customize patterns in `pipeline/config.py`:
```python
variant_hd_suffixes   = ["-hd", "_hd", "-premium", ...]
variant_free_suffixes = ["-free", "_free", ...]
variant_hd_prefixes   = ["hd/", "premium/"]
```

---

## Scaling to 10,000+ Images

| Step | Cost at 10k | Time estimate | Notes |
|------|-------------|---------------|-------|
| Ingest | $0 | ~2 min | R2 listing is free |
| Analyze (GPT-4o) | ~$50–80 | ~3–5 hrs | 5 concurrent workers |
| Embed (CLIP) | $0 | ~20 min CPU / 3 min GPU | Fully local |
| Cluster (HDBSCAN) | $0 | ~30 sec | 10k × 20d in RAM = 2MB |
| Metadata (GPT-4o-mini) | ~$5–10 | ~1–2 hrs | 8 workers |
| Export | $0 | ~10 sec | SQL join + file write |
| **Total** | **~$60–90** | **~5–8 hrs** | Resumable at any step |

**Cost reduction strategies:**
- Use `--vision-model gpt-4o-mini` if image quality is consistent (10× cheaper)
- Use `detail: low` in vision calls (already enabled — 85 tokens vs 1000+)
- Cache: already idempotent, re-runs cost $0 for completed steps
- Batching: increase `--workers` if your OpenAI tier allows higher RPM
- For 100k+ images: swap SQLite for PostgreSQL + pgvector; swap FAISS flat index for HNSW

---

## Database Schema

```sql
assets          — asset_id, base_name, variant URLs + keys
vision_analysis — GPT-4o output per asset (scene, style, objects, colors…)
embeddings      — CLIP float32 vector blob per asset
clusters        — cluster_id, label, centroid, size
asset_clusters  — asset_id → cluster_id mapping + centroid distance
metadata        — LLM-generated title, description, alt, keywords…
pipeline_log    — step run history
```

Query example — find all images in a cluster:
```sql
SELECT a.base_name, a.web_url, m.title, m.seo_slug
FROM assets a
JOIN asset_clusters ac ON ac.asset_id = a.asset_id
JOIN clusters c ON c.cluster_id = ac.cluster_id
JOIN metadata m ON m.asset_id = a.asset_id
WHERE c.label = 'warm_coastal_golden_hour'
ORDER BY ac.distance_to_centroid;
```

---

## Similarity Search (FAISS)

```python
import faiss, numpy as np
from sentence_transformers import SentenceTransformer
from PIL import Image

model = SentenceTransformer("clip-ViT-B-32")
index = faiss.read_index("outputs/embeddings.faiss")
ids   = np.load("outputs/embeddings_ids.npy")

# Find visually similar images to a query image
query_vec = model.encode([Image.open("query.jpg")], normalize_embeddings=True)
distances, indices = index.search(query_vec.astype(np.float32), k=10)
similar_asset_ids = ids[indices[0]]
```
