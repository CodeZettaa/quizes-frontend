import { Component, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "./auth/services/auth.service";
import { PwaService } from "./services/pwa.service";
import { PwaInstallPromptComponent } from "./components/pwa-install-prompt/pwa-install-prompt.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, PwaInstallPromptComponent],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/dashboard" class="brand">QuizHub</a>
        <div class="nav-links" *ngIf="isLoggedIn()">
          <a routerLink="/dashboard">📊 Dashboard</a>
          <a routerLink="/leaderboard">🏆 Leaderboard</a>
          <a routerLink="/profile">👤 Profile</a>
          <a routerLink="/settings">⚙️ Settings</a>
          <a *ngIf="isAdmin()" routerLink="/admin/subjects">🔧 Admin</a>
          <button class="btn secondary" (click)="logout()">Logout</button>
        </div>
        <div class="nav-links" *ngIf="!isLoggedIn()">
          <a routerLink="/auth/login">Login</a>
          <a class="btn" routerLink="/auth/register">Register</a>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
    <app-pwa-install-prompt />
  `,
  styles: [
    `
      .brand {
        font-weight: 700;
        color: var(--text-primary, #111827);
      }
      nav button {
        padding: 0.4rem 0.75rem;
      }
      [data-theme="dark"] .brand {
        color: var(--text-primary, #f3f4f6);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly pwaService = inject(PwaService);

  isLoggedIn = computed(() => this.auth.isAuthenticated());
  isAdmin = computed(() => this.auth.isAdmin());

  ngOnInit() {
    // Initialize PWA service
    if (this.pwaService.isServiceWorkerSupported()) {
      console.log("Service Worker is supported");
    }

    // Load user profile if token exists (from storage)
    if (this.auth.isAuthenticated() && !this.auth.currentUser()) {
      this.auth.loadMe().subscribe({
        error: (err) => {
          console.error("Failed to load user profile on startup:", err);
          // Clear auth if token is invalid
          if (err.status === 401) {
            this.auth.clearAuth();
          }
        },
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
