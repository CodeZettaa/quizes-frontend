import { Component, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "./auth/services/auth.service";
import { PwaService } from "./services/pwa.service";
import { PwaInstallPromptComponent } from "./components/pwa-install-prompt/pwa-install-prompt.component";
import { QuizSessionService } from "./services/quiz-session.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, PwaInstallPromptComponent],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/dashboard" class="brand">
          <img
            class="brand-logo"
            src="assets/logo.svg"
            alt="QuizHub"
            width="180"
            height="105"
            loading="eager"
          />
        </a>
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
    <footer class="site-footer">
      <span>Powered by Codezetta</span>
    </footer>
    <app-pwa-install-prompt />
  `,
  styles: [
    `
      nav button {
        padding: 0.4rem 0.75rem;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly pwaService = inject(PwaService);
  private readonly quizSessionService = inject(QuizSessionService);
  private readonly router = inject(Router);

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

    if (this.auth.isAuthenticated()) {
      this.checkActiveSession();
    }
  }

  logout() {
    this.auth.logout();
  }

  private checkActiveSession() {
    this.quizSessionService.getActiveSession().subscribe({
      next: (session) => {
        if (!session.hasActiveSession || !session.sessionId || !session.quizId) {
          return;
        }
        const shouldContinue = window.confirm(
          "You have an active quiz session. Continue?"
        );
        if (shouldContinue) {
          this.router.navigate([`/quiz/${session.quizId}`], {
            queryParams: { sessionId: session.sessionId },
          });
          return;
        }
        this.quizSessionService.abandon(session.sessionId).subscribe({
          error: () => {
            // No-op: still allow user to continue.
          },
        });
      },
      error: () => {
        // Ignore if not authenticated or endpoint unavailable.
      },
    });
  }
}
