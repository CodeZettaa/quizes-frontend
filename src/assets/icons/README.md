# PWA Icons

This directory should contain the following icon files for PWA support:

- icon-72x72.png (72x72 pixels)
- icon-96x96.png (96x96 pixels)
- icon-128x128.png (128x128 pixels)
- icon-144x144.png (144x144 pixels)
- icon-152x152.png (152x152 pixels)
- icon-192x192.png (192x192 pixels) - Required
- icon-384x384.png (384x384 pixels)
- icon-512x512.png (512x512 pixels) - Required

## Generating Icons

You can generate these icons from a single source image (at least 512x512) using online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick:
```bash
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
# etc.
```

For now, you can use placeholder icons or create simple colored squares as placeholders.

