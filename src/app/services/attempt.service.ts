import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { AttemptDetails, AttemptSummary, Subject } from "../types";

export interface AttemptListResponse {
  items: AttemptSummary[];
  page: number;
  limit: number;
  total: number;
}

@Injectable({ providedIn: "root" })
export class AttemptService {
  constructor(private http: HttpClient) {}

  private normalizeSubject(subject: any): Subject | null {
    if (!subject) return null;
    return {
      id: subject.id || subject._id || "",
      name: subject.name || "",
      description: subject.description || "",
    };
  }

  private normalizeSummary(attempt: any): AttemptSummary {
    return {
      attemptId: attempt.attemptId || attempt.id || attempt._id || "",
      quizId: attempt.quizId || attempt.quiz?.id || attempt.quiz?._id || "",
      quizTitle: attempt.quizTitle || attempt.quiz?.title || "Unknown Quiz",
      subject: this.normalizeSubject(attempt.subject || attempt.quiz?.subject),
      level: attempt.level || attempt.quiz?.level || null,
      score: attempt.score || 0,
      totalQuestions: attempt.totalQuestions || 0,
      correctAnswersCount: attempt.correctAnswersCount || 0,
      pointsEarned: attempt.pointsEarned || 0,
      finishedAt: attempt.finishedAt || "",
    };
  }

  private normalizeDetails(attempt: any): AttemptDetails {
    const summary = this.normalizeSummary(attempt);
    return {
      ...summary,
      questions: (attempt.questions || []).map((q: any) => ({
        id: q.id || q._id || "",
        text: q.text || "",
        type: q.type || "mcq",
        options: (q.options || []).map((opt: any) => ({
          id: opt.id || opt._id || "",
          text: opt.text || "",
          isCorrect: !!opt.isCorrect,
        })),
        userAnswer: q.userAnswer
          ? {
              selectedOptionId: q.userAnswer.selectedOptionId || "",
              isCorrect: !!q.userAnswer.isCorrect,
            }
          : null,
      })),
    };
  }

  getMyAttempts(params?: {
    subjectId?: string;
    level?: string;
    page?: number;
    limit?: number;
  }): Observable<AttemptListResponse> {
    const query = new URLSearchParams();
    if (params?.subjectId) query.set("subjectId", params.subjectId);
    if (params?.level) query.set("level", params.level);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const url = qs
      ? `${environment.apiUrl}/users/me/attempts?${qs}`
      : `${environment.apiUrl}/users/me/attempts`;

    return this.http.get<AttemptListResponse>(url).pipe(
      map((response) => ({
        ...response,
        items: (response.items || []).map((attempt) => this.normalizeSummary(attempt)),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error("Error fetching attempts:", error);
        return throwError(() => error);
      })
    );
  }

  getAttempt(attemptId: string): Observable<AttemptDetails> {
    return this.http.get<any>(`${environment.apiUrl}/attempts/${attemptId}`).pipe(
      map((attempt) => this.normalizeDetails(attempt)),
      catchError((error: HttpErrorResponse) => {
        console.error("Error fetching attempt:", error);
        return throwError(() => error);
      })
    );
  }
}
