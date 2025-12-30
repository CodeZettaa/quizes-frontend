import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";

export interface QuizSessionStartResponse {
  sessionId: string;
  quizId: string;
  expiresAt: string;
}

export interface QuizSessionHeartbeatResponse {
  ok: boolean;
  expiresAt: string;
}

export interface QuizSessionActiveResponse {
  hasActiveSession: boolean;
  sessionId?: string;
  quizId?: string;
  expiresAt?: string;
}

@Injectable({ providedIn: "root" })
export class QuizSessionService {
  constructor(private http: HttpClient) {}

  start(quizId: string): Observable<QuizSessionStartResponse> {
    return this.http
      .post<QuizSessionStartResponse>(`${environment.apiUrl}/quizzes/${quizId}/start`, {})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  heartbeat(sessionId: string): Observable<QuizSessionHeartbeatResponse> {
    return this.http
      .post<QuizSessionHeartbeatResponse>(
        `${environment.apiUrl}/quizzes/session/${sessionId}/heartbeat`,
        {}
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  abandon(sessionId: string): Observable<{ ok: boolean }> {
    return this.http
      .post<{ ok: boolean }>(
        `${environment.apiUrl}/quizzes/session/${sessionId}/abandon`,
        {}
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  getActiveSession(): Observable<QuizSessionActiveResponse> {
    return this.http
      .get<QuizSessionActiveResponse>(`${environment.apiUrl}/users/me/active-session`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }
}
