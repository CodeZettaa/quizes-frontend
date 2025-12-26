import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, signal, inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { User } from "../types";
import { PreferencesStore } from "../user/services/preferences.store";

interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Authentication Service
 *
 * Handles user authentication, token management, and session persistence.
 *
 * Token Storage:
 * - Currently uses localStorage for token persistence
 * - Tokens are stored in localStorage for client-side access
 *
 * HttpOnly Cookies (Backend Implementation):
 * For enhanced security, consider implementing httpOnly cookies on the backend:
 * - Backend sets httpOnly cookie with token on login/register
 * - Cookie is automatically sent with each request (no JavaScript access needed)
 * - More secure as it prevents XSS attacks from accessing tokens
 * - Requires backend to set: res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })
 * - Frontend would remove localStorage usage and rely on cookies being sent automatically
 *
 * Current Implementation:
 * - Token stored in localStorage (accessible to JavaScript)
 * - User data cached in localStorage for faster initial load
 * - Token validated on app initialization
 * - Automatic logout on 401 Unauthorized responses
 */
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly storageKey = "quiz_token";
  private readonly userStorageKey = "quiz_user";

  token = signal<string | null>(this.getStoredToken());
  currentUser = signal<User | null>(this.getStoredUser());
  // Allow authentication if we have a token (user can be loaded async)
  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.role === "admin");
  private isInitializing = true;

  private readonly preferencesStore = inject(PreferencesStore);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    // Restore session on app initialization
    this.initializeAuth();
  }

  /**
   * Initialize authentication state on app startup
   * Restores token and user from localStorage and validates with backend
   */
  private initializeAuth() {
    const storedToken = this.getStoredToken();
    const storedUser = this.getStoredUser();

    if (storedToken) {
      // Set token immediately so guard allows access
      this.token.set(storedToken);

      // Set user if available (for faster initial render)
      if (storedUser) {
        this.currentUser.set(storedUser);

        // Initialize preferences from stored user data immediately
        if (storedUser.preferences) {
          this.preferencesStore.initialize(storedUser.preferences);
        }
      }

      // Validate token with backend and refresh user data
      // Only clear auth on 401 (unauthorized), not on network errors
      this.refreshProfile().subscribe({
        next: (user) => {
          // Token is valid, update user data
          this.currentUser.set(user);
          this.saveUser(user);

          // Initialize preferences from user data
          if (user.preferences) {
            this.preferencesStore.initialize(user.preferences);
          }

          this.isInitializing = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isInitializing = false;

          // Only clear auth if token is actually invalid (401)
          // Don't clear on network errors, server errors, etc.
          if (error.status === 401) {
            console.warn("Token is invalid or expired, clearing session");
            this.clearAuth();

            // Only redirect if not already on login/register page
            const currentPath = this.router.url;
            if (!currentPath.startsWith("/auth/")) {
              this.router.navigate(["/auth/login"]);
            }
          } else {
            // Network error or server error - keep token, just log the error
            // User can still use the app with cached data
            console.warn(
              "Failed to refresh profile, but keeping session:",
              error.status,
              error.message
            );
            // Keep the cached user data if available
          }
        },
      });
    } else {
      // No stored token, ensure clean state
      this.clearAuth();
      this.isInitializing = false;
    }
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
      return null;
    }
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.userStorageKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      return null;
    }
  }

  /**
   * Save token to localStorage
   */
  private saveToken(token: string): void {
    try {
      localStorage.setItem(this.storageKey, token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }

  /**
   * Set token (public method for social login)
   */
  setToken(token: string): void {
    this.token.set(token);
    this.saveToken(token);
  }

  /**
   * Clear token (public method)
   */
  clearToken(): void {
    this.token.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Error clearing token from localStorage:", error);
    }
  }

  /**
   * Load user profile from backend (alias for refreshProfile for clarity)
   */
  loadMe() {
    return this.refreshProfile();
  }

  /**
   * Save user to localStorage
   */
  private saveUser(user: User): void {
    try {
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuth(): void {
    this.token.set(null);
    this.currentUser.set(null);
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userStorageKey);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => this.handleAuth(res)),
        catchError((error: HttpErrorResponse) => {
          console.error("Login error:", error);
          return throwError(() => error);
        })
      );
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        name,
        email,
        password,
      })
      .pipe(
        tap((res) => this.handleAuth(res)),
        catchError((error: HttpErrorResponse) => {
          console.error("Register error:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh user profile from backend
   * Validates token and updates user data
   * Note: This method does NOT clear auth on error - that's handled by the caller
   */
  refreshProfile() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUser(user);

        // Update preferences if they changed
        if (user.preferences) {
          this.preferencesStore.initialize(user.preferences);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Don't clear auth here - let the caller decide based on error type
        // This prevents clearing auth on network errors, etc.
        return throwError(() => error);
      })
    );
  }

  logout() {
    // Optionally call backend logout endpoint
    // this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();

    this.clearAuth();
    this.router.navigate(["/auth/login"]);
  }

  /**
   * Clear all authentication data (public method)
   */
  clearAuthData(): void {
    this.clearAuth();
  }

  /**
   * Handle successful authentication response
   * Saves token and user to localStorage and updates signals
   */
  private handleAuth(res: AuthResponse) {
    this.token.set(res.accessToken);
    this.currentUser.set(res.user);
    this.saveToken(res.accessToken);
    this.saveUser(res.user);

    // Initialize preferences from user data
    if (res.user.preferences) {
      this.preferencesStore.initialize(res.user.preferences);
    }
  }

  /**
   * Check if user is authenticated (synchronous check)
   * Use isAuthenticated computed signal for reactive checks
   */
  checkAuth(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Update user's total points (used after quiz submission)
   */
  updateUserPoints(newTotalPoints: number): void {
    const user = this.currentUser();
    if (user) {
      const updatedUser = {
        ...user,
        totalPoints: newTotalPoints
      };
      this.currentUser.set(updatedUser);
      this.saveUser(updatedUser);
    }
  }
}
