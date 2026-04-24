# Pinterest Automation Engine

Deterministic Pinterest pin + schedule generator. Reads `image-pipeline/final_manifest.json`, writes Tailwind-compatible CSVs to `pinterest-engine/output/`.

## Commands

```bash
node pinterest-engine/cli.js generate master     # master-pins.csv (1 row per image, SEO title)
node pinterest-engine/cli.js generate ab         # ab-pins.csv (2 rows per image: SEO + CTR)
node pinterest-engine/cli.js generate schedule   # scheduled-pins.csv (round-robin daily batches)
node pinterest-engine/cli.js generate all        # all three
```

Optional: pass a custom manifest path as the final arg.

## Guarantees

- Deterministic: manifest sorted by `slug` ASC; all rotation by `index % N`; no `Date.now`, no `Math.random`.
- O(n): single-pass generation, single-pass scheduling.
- CSV-safe: UTF-8, every field quoted, quotes escaped as `""`, no embedded newlines, fixed column count.
- Hard-fail validation before any file is written.

## Columns

`Title, Description, Image, Link, Board`

## Modules

- `lib/parser.js` — reads + validates manifest, sorts by slug.
- `lib/generator.js` — SEO + CTR title rotation, description, alt, image URL, link.
- `lib/board-mapper.js` — category-prefix + tag-override board assignment.
- `lib/scheduler.js` — round-robin with max 2 per category per day, no consecutive duplicates, 5 pins/day.
- `lib/validator.js` — row-level hard-fail checks.
- `lib/csv-writer.js` — quoted CSV emitter.
