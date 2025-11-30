#!/bin/bash

# Base directory
BASE="public/images"
SOURCE="$BASE/christmas-backgrounds"

# Modern images
MODERN=(04 05 10 11 13 14 15 16 18 20 24 25 28 32 33 34 43 44)
for num in "${MODERN[@]}"; do
  cp "$SOURCE/christmas-background-$num.webp" "$BASE/christmas-modern/"
  echo "Copied $num to Modern"
done

# Traditional images
TRAD=(01 07 08 09 19 21 26 29 35 41)
for num in "${TRAD[@]}"; do
  cp "$SOURCE/christmas-background-$num.webp" "$BASE/christmas-traditional/"
  echo "Copied $num to Traditional"
done

# Rustic images
RUSTIC=(02 03 12 17 22 23 27 30 31 36 37 38 39 40 42)
for num in "${RUSTIC[@]}"; do
  cp "$SOURCE/christmas-background-$num.webp" "$BASE/christmas-rustic/"
  echo "Copied $num to Rustic"
done

echo "Done! Review the folders, then delete christmas-backgrounds if happy."
