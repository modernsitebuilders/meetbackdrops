#!/bin/bash
set -e

echo "🎄 Adding 84 new Christmas images as 47-130..."

counter=47

# Modern variants (mod, con, coz, neu, cre)
for file in ~/Downloads/streambackdrops_*mod*.png ~/Downloads/streambackdrops_*con*.png ~/Downloads/streambackdrops_*coz*.png ~/Downloads/streambackdrops_*neu*.png ~/Downloads/streambackdrops_*cre*.png; do
  [ -f "$file" ] || continue
  cp "$file" "public/images/christmas-backgrounds/christmas-background-$(printf %02d $counter).png"
  echo "$counter:modern" >> christmas-style-mapping.txt
  ((counter++))
done

# Traditional variants (tra, cla, ele, dis)
for file in ~/Downloads/streambackdrops_*tra*.png ~/Downloads/streambackdrops_*cla*.png ~/Downloads/streambackdrops_*ele*.png ~/Downloads/streambackdrops_*dis*.png; do
  [ -f "$file" ] || continue
  cp "$file" "public/images/christmas-backgrounds/christmas-background-$(printf %02d $counter).png"
  echo "$counter:traditional" >> christmas-style-mapping.txt
  ((counter++))
done

# Rustic variants (rus, war, far, mou)
for file in ~/Downloads/streambackdrops_*rus*.png ~/Downloads/streambackdrops_*war*.png ~/Downloads/streambackdrops_*far*.png ~/Downloads/streambackdrops_*mou*.png; do
  [ -f "$file" ] || continue
  cp "$file" "public/images/christmas-backgrounds/christmas-background-$(printf %02d $counter).png"
  echo "$counter:rustic" >> christmas-style-mapping.txt
  ((counter++))
done

echo "✅ Copied $((counter-47)) files"
echo "📋 Mapping saved to christmas-style-mapping.txt"
ls public/images/christmas-backgrounds/*.png | wc -l
