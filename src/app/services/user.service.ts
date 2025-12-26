import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import {
  User,
  UserPreferences,
  UserStats,
  LeaderboardEntry,
  QuizAttempt,
} from "../types";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("Error fetching user:", error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateMe(
    payload: Partial<Omit<User, "preferences">> & {
      preferences?: Partial<UserPreferences>;
    }
  ): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error("Error updating user:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update user password
   */
  updatePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiUrl}/users/me/password`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error("Error updating password:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user statistics
   */
  getMyStats(): Observable<UserStats> {
    return this.http
      .get<UserStats>(`${environment.apiUrl}/users/me/stats`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error("Error fetching stats:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http
      .get<LeaderboardEntry[]>(`${environment.apiUrl}/leaderboard`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error("Error fetching leaderboard:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user quiz attempts
   */
  getAttempts(limit?: number): Observable<QuizAttempt[]> {
    const url = limit
      ? `${environment.apiUrl}/users/me/attempts?limit=${limit}`
      : `${environment.apiUrl}/users/me/attempts`;
    return this.http.get<QuizAttempt[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("Error fetching attempts:", error);
        return throwError(() => error);
      })
    );
  }

  // Legacy methods for backward compatibility
  getProfile(): Observable<User> {
    return this.getMe();
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.updateMe(data);
  }
}
