import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showPrompt()) {
      <div class="install-prompt">
        <div class="install-prompt-content">
          <div class="install-icon">📱</div>
          <div class="install-text">
            <h4>Install QuizHub</h4>
            <p>Install our app for a better experience</p>
          </div>
          <div class="install-actions">
            <button class="btn-install" (click)="install()">Install</button>
            <button class="btn-dismiss" (click)="dismiss()">✕</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .install-prompt {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      max-width: 500px;
      width: calc(100% - 2rem);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .install-prompt-content {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 1rem 1.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 2px solid var(--primary-color, #6366f1);
    }

    .install-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .install-text {
      flex: 1;
    }

    .install-text h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .install-text p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-secondary, #6b7280);
    }

    .install-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-install {
      background: var(--primary-color, #6366f1);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-install:hover {
      background: var(--primary-dark, #4f46e5);
      transform: translateY(-2px);
    }

    .btn-dismiss {
      background: transparent;
      border: none;
      color: var(--text-secondary, #6b7280);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-dismiss:hover {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    [data-theme="dark"] .install-prompt-content {
      background: #1f2937;
      border-color: #818cf8;
    }

    @media (max-width: 640px) {
      .install-prompt {
        left: 1rem;
        right: 1rem;
        transform: none;
        max-width: none;
        width: auto;
      }

      .install-prompt-content {
        flex-direction: column;
        text-align: center;
      }

      .install-actions {
        width: 100%;
        justify-content: center;
      }

      .btn-install {
        flex: 1;
      }
    }
  `]
})
export class PwaInstallPromptComponent implements OnInit {
  private pwaService = inject(PwaService);
  showPrompt = signal(false);

  ngOnInit() {
    // Don't show if already installed
    if (this.pwaService.isInstalled()) {
      return;
    }

    // Check if install prompt is available
    if (this.pwaService.canInstall()) {
      // Show prompt after a delay
      setTimeout(() => {
        // Check if user has dismissed it before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          this.showPrompt.set(true);
        }
      }, 3000);
    }
  }

  async install() {
    const installed = await this.pwaService.install();
    if (installed) {
      this.showPrompt.set(false);
    }
  }

  dismiss() {
    this.showPrompt.set(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  }
}

