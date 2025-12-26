import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-social-callback',
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card callback-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <h2>Signing you in...</h2>
            <p>Please wait while we complete your authentication.</p>
          </div>
        }

        @if (error()) {
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h2>Authentication Failed</h2>
            <p class="error-message">{{ error() }}</p>
            <div class="error-actions">
              <button class="btn primary" (click)="goToLogin()">Go to Login</button>
              <button class="btn secondary" (click)="retry()" *ngIf="canRetry()">Retry</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .callback-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 3rem 2rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--bg-secondary, #f3f4f6);
      border-top-color: var(--primary-color, #6366f1);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary, #1f2937);
    }

    .loading-state p {
      margin: 0;
      color: var(--text-secondary, #6b7280);
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .error-icon {
      font-size: 4rem;
    }

    .error-state h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary, #1f2937);
    }

    .error-message {
      margin: 0;
      color: var(--text-secondary, #6b7280);
      padding: 1rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 8px;
      width: 100%;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      width: 100%;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn.primary {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .btn.primary:hover {
      background: var(--primary-dark, #4f46e5);
      transform: translateY(-2px);
    }

    .btn.secondary {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    .btn.secondary:hover {
      background: var(--border-color, #e5e7eb);
    }

    [data-theme="dark"] .callback-card {
      background: var(--bg-card, #1f2937);
    }

    [data-theme="dark"] .error-message {
      background: var(--bg-secondary, #111827);
      color: var(--text-secondary, #9ca3af);
    }
  `]
})
export class SocialCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);
  private token: string | null = null;
  private newUser: boolean = false;

  ngOnInit() {
    this.handleCallback();
  }

  private handleCallback() {
    this.route.queryParams.subscribe(params => {
      const errorParam = params['error'];
      const tokenParam = params['token'];
      const newUserParam = params['newUser'];

      // Check for error first
      if (errorParam) {
        this.error.set(errorParam === 'social_login_failed' 
          ? 'Social login failed. Please try again or use email/password.' 
          : 'An error occurred during authentication.');
        this.loading.set(false);
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          this.goToLogin();
        }, 5000);
        return;
      }

      // Check for token
      if (!tokenParam) {
        this.error.set('No authentication token received. Please try logging in again.');
        this.loading.set(false);
        setTimeout(() => {
          this.goToLogin();
        }, 3000);
        return;
      }

      this.token = tokenParam;
      this.newUser = newUserParam === 'true' || newUserParam === true;

      // Set token and load user (token is guaranteed to be non-null here)
      if (this.token) {
        this.authService.setToken(this.token);
        this.loadUserProfile();
      }
    });
  }

  private loadUserProfile() {
    this.authService.loadMe().subscribe({
      next: (user) => {
        // User loaded successfully
        this.loading.set(false);
        
        // Redirect based on whether it's a new user
        if (this.newUser) {
          // New user - redirect to settings or profile to complete setup
          this.router.navigate(['/settings']);
        } else {
          // Existing user - go to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error.set('Could not load your profile. Please try again.');
        this.loading.set(false);
        // Clear token on error
        this.authService.clearToken();
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  retry() {
    // Clear error and try again
    this.error.set(null);
    this.loading.set(true);
    
    if (this.token && this.token.trim()) {
      this.authService.setToken(this.token);
      this.loadUserProfile();
    } else {
      this.goToLogin();
    }
  }

  canRetry(): boolean {
    return !!this.token;
  }
}

