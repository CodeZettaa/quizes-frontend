import { Injectable, computed, signal } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, tap, throwError, map } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { User, AuthMeResponse } from "../models/auth.models";

const TOKEN_STORAGE_KEY = "quiz_auth_token";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  // Signals
  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<User | null>(null);

  // Public readonly signals
  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.role === "admin");

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router
  ) {
    // Initialize from storage on service creation
    this.initFromStorage();
  }

  /**
   * Get token (helper method)
   */
  getToken(): string | null {
    return this._token();
  }

  /**
   * Set token and store in localStorage
   */
  setToken(token: string): void {
    this._token.set(token);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }

  /**
   * Set user (helper method)
   */
  setUser(user: User): void {
    this._currentUser.set(user);
  }

  /**
   * Load user profile from backend
   */
  loadMe(): Observable<User> {
    return this.httpClient
      .get<AuthMeResponse>(`${environment.apiBaseUrl}/api/auth/me`)
      .pipe(
        tap((user) => {
          this._currentUser.set(user);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error("Error loading user profile:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Initialize auth state from localStorage
   */
  initFromStorage(): void {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        this._token.set(storedToken);
        // Optionally load user profile here
        // this.loadMe().subscribe();
      }
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
    }
  }

  /**
   * Clear authentication data (public method)
   */
  clearAuth(): void {
    this._token.set(null);
    this._currentUser.set(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing token from localStorage:", error);
    }
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User> {
    return this.httpClient
      .post<AuthResponse>(`${environment.apiBaseUrl}/api/auth/login`, {
        email,
        password,
      } as LoginRequest)
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
          this.setUser(res.user);
        }),
        map((res: AuthResponse) => res.user),
        catchError((error: HttpErrorResponse) => {
          console.error("Login error:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register with email and password
   */
  register(name: string, email: string, password: string): Observable<User> {
    return this.httpClient
      .post<AuthResponse>(`${environment.apiBaseUrl}/api/auth/register`, {
        name,
        email,
        password,
      } as RegisterRequest)
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
          this.setUser(res.user);
        }),
        map((res: AuthResponse) => res.user),
        catchError((error: HttpErrorResponse) => {
          console.error("Register error:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(["/auth/login"]);
  }
}
