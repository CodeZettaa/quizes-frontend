import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../auth/services/auth.service";
import { environment } from "../../../environments/environment";

@Component({
  standalone: true,
  selector: "app-register",
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card auth-card">
        <h2 class="auth-title">Create Account</h2>

        <!-- Social Login Buttons -->
        <div class="social-buttons">
          <button class="btn-social btn-google" (click)="registerWithGoogle()">
            <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            class="btn-social btn-linkedin"
            (click)="registerWithLinkedIn()"
          >
            <svg
              class="social-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="#0077B5"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>or continue with email</span>
        </div>

        <!-- Email/Password Form -->
        <form (ngSubmit)="submit()" class="auth-form">
          <input
            class="input"
            [(ngModel)]="name"
            name="name"
            placeholder="Full name"
            required
          />
          <input
            class="input"
            [(ngModel)]="email"
            name="email"
            placeholder="Email"
            required
            type="email"
          />
          <input
            class="input"
            [(ngModel)]="password"
            name="password"
            placeholder="Password"
            type="password"
            required
            minlength="6"
          />
          <button class="btn btn-primary" type="submit">Register</button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Login</a>
        </p>

        @if (error()) {
        <p class="error-message">
          {{ error() }}
        </p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .auth-card {
        max-width: 480px;
        margin: 2rem auto;
        padding: 2rem;
      }

      .auth-title {
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary, #1f2937);
      }

      .social-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .btn-social {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.875rem 1.5rem;
        border: 2px solid var(--border-color, #e5e7eb);
        border-radius: 10px;
        background: var(--bg-card, white);
        color: var(--text-primary, #1f2937);
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-social:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .btn-google:hover {
        border-color: #4285f4;
        background: #f8f9ff;
      }

      .btn-linkedin:hover {
        border-color: #0077b5;
        background: #f0f7ff;
      }

      .social-icon {
        flex-shrink: 0;
      }

      .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 1.5rem 0;
        color: var(--text-secondary, #6b7280);
        font-size: 0.9rem;
      }

      .divider::before,
      .divider::after {
        content: "";
        flex: 1;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }

      .divider span {
        padding: 0 1rem;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        font-size: 1rem;
        background: var(--bg-card, white);
        color: var(--text-primary, #1f2937);
        transition: border-color 0.2s;
      }

      .input:focus {
        outline: none;
        border-color: var(--primary-color, #6366f1);
      }

      .btn-primary {
        width: 100%;
        padding: 0.875rem 1.5rem;
        background: var(--primary-color, #6366f1);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary:hover {
        background: var(--primary-dark, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .auth-footer {
        margin-top: 1.5rem;
        text-align: center;
        color: var(--text-secondary, #6b7280);
      }

      .auth-footer a {
        color: var(--primary-color, #6366f1);
        font-weight: 600;
        text-decoration: none;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }

      .error-message {
        color: #ef4444;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fee2e2;
        border-radius: 8px;
        text-align: center;
        font-size: 0.9rem;
      }

      [data-theme="dark"] .btn-social {
        background: var(--bg-card, #1f2937);
        border-color: var(--border-color, #374151);
        color: var(--text-primary, #f3f4f6);
      }

      [data-theme="dark"] .input {
        background: var(--bg-card, #1f2937);
        border-color: var(--border-color, #374151);
        color: var(--text-primary, #f3f4f6);
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = "";
  email = "";
  password = "";
  error = signal("");

  registerWithGoogle() {
    window.location.href = `${environment.apiBaseUrl}/api/auth/google`;
  }

  registerWithLinkedIn() {
    window.location.href = `${environment.apiBaseUrl}/api/auth/linkedin`;
  }

  submit() {
    this.error.set("");
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Registration failed");
      },
    });
  }
}
