import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private promptEvent: any = null;
  private swUpdate = inject(SwUpdate, { optional: true });

  constructor() {
    if (this.swUpdate?.isEnabled) {
      // Check for updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm('New version available. Load it?')) {
            window.location.reload();
          }
        });

      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate?.checkForUpdate();
      }, 6 * 60 * 60 * 1000);
    }

    // Listen for beforeinstallprompt event
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.promptEvent = e;
      });
    }
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.promptEvent !== null;
  }

  /**
   * Show install prompt
   */
  async install(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    this.promptEvent.prompt();
    const { outcome } = await this.promptEvent.userChoice;
    this.promptEvent = null;

    return outcome === 'accepted';
  }

  /**
   * Check if app is installed (running as PWA)
   */
  isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  /**
   * Check if service worker is supported
   */
  isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

