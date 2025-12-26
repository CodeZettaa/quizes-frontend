#!/bin/bash
# Simple script to generate placeholder PWA icons
# Requires ImageMagick: brew install imagemagick (on macOS)

SIZES=(72 96 128 144 152 192 384 512)
COLOR="#6366f1"

echo "Generating PWA icons..."

mkdir -p src/assets/icons

for size in "${SIZES[@]}"; do
  convert -size ${size}x${size} xc:"${COLOR}" \
    -gravity center \
    -pointsize $((size/3)) \
    -fill white \
    -annotate +0+0 "Q" \
    "src/assets/icons/icon-${size}x${size}.png"
  echo "Generated icon-${size}x${size}.png"
done

echo "Done! Icons generated in src/assets/icons/"

