# PWA Setup Guide

This application is configured as a Progressive Web App (PWA) with the following features:

## Features

✅ **Service Worker** - Offline support and caching
✅ **Web App Manifest** - Installable app
✅ **Install Prompt** - User-friendly installation
✅ **Update Notifications** - Automatic update detection
✅ **Offline Support** - Cached assets and API responses

## Setup

### 1. Generate Icons

You need to create PWA icons in `src/assets/icons/`:

**Option A: Using the script (requires ImageMagick)**
```bash
./generate-icons.sh
```

**Option B: Manual creation**
Create icons with these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

You can use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

**Option C: Use a single 512x512 icon**
The browser will scale it, but having all sizes is recommended for best performance.

### 2. Build for Production

The service worker is only enabled in production builds:

```bash
npm run build
```

This will:
- Generate the service worker
- Include the manifest
- Cache assets for offline use

### 3. Test PWA Features

**Local Testing:**
```bash
# Build for production
npm run build

# Serve the production build
npx http-server dist/quiz-frontend -p 8080
```

**Or use Angular's production serve:**
```bash
ng serve --configuration production
```

## How It Works

### Service Worker
- **Enabled**: Only in production builds
- **Registration**: Automatic after app loads (30s delay)
- **Caching Strategy**:
  - App files: Prefetch (cached immediately)
  - Assets: Lazy load (cached on demand)
  - API calls: Freshness strategy (1 hour cache, 5s timeout)

### Install Prompt
- Shows automatically after 3 seconds if:
  - App is not installed
  - Browser supports installation
  - User hasn't dismissed it in the last 7 days
- Can be manually triggered via `PwaService.install()`

### Update Detection
- Checks for updates every 6 hours
- Shows prompt when new version is available
- User can choose to reload immediately

## Configuration Files

- `src/manifest.webmanifest` - App manifest (name, icons, theme)
- `src/ngsw-config.json` - Service worker configuration
- `src/app/services/pwa.service.ts` - PWA service for install/update
- `src/app/components/pwa-install-prompt/` - Install prompt component

## Browser Support

✅ Chrome/Edge (Desktop & Mobile)
✅ Firefox (Desktop & Mobile)
✅ Safari (iOS 11.3+, macOS)
✅ Samsung Internet

## Testing Checklist

- [ ] Icons are generated and placed in `src/assets/icons/`
- [ ] Build production version: `npm run build`
- [ ] Test install prompt appears
- [ ] Test app installs correctly
- [ ] Test offline functionality
- [ ] Test update detection
- [ ] Verify manifest in DevTools > Application > Manifest
- [ ] Verify service worker in DevTools > Application > Service Workers

## Troubleshooting

**Service worker not registering:**
- Make sure you're running a production build
- Check browser console for errors
- Verify HTTPS (required for service workers, except localhost)

**Install prompt not showing:**
- App might already be installed
- Browser might not support installation
- Check `PwaService.canInstall()` in console

**Icons not showing:**
- Verify icons exist in `src/assets/icons/`
- Check manifest.json references correct paths
- Clear browser cache

## Next Steps

1. Generate or create proper app icons
2. Customize manifest (name, description, theme color)
3. Test on real devices
4. Deploy to HTTPS server (required for service workers)

