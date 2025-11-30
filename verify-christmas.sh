#!/bin/bash
echo "Opening images 113-127 one at a time..."
echo "Press ENTER after viewing each to continue"

for i in {113..127}; do
  echo "---"
  echo "Image $i:"
  grep -A 7 "christmas-backgrounds-$i" public/data/image-metadata-complete.json | grep "alt"
  open public/images/christmas-backgrounds/christmas-background-$(printf %02d $i).webp
  read
done
