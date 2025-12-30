import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Quiz, QuizSubmissionResult, SubmitQuizResponse, QuizAttempt, QuizAttemptDetail } from '../types';

@Injectable({ providedIn: 'root' })
export class QuizzesService {
  constructor(private http: HttpClient) {}

  private normalizeQuiz(quiz: any): Quiz {
    return {
      ...quiz,
      id: quiz.id || quiz._id || '',
      subject: quiz.subject ? {
        ...quiz.subject,
        id: quiz.subject.id || quiz.subject._id || '',
      } : quiz.subject,
      questions: (quiz.questions || []).map((q: any) => ({
        ...q,
        id: q.id || q._id || '',
        options: (q.options || []).map((opt: any) => ({
          ...opt,
          id: opt.id || opt._id || '',
        })),
      })),
      taken: typeof quiz.taken === 'boolean' ? quiz.taken : !!quiz.hasTaken,
      attemptId: quiz.attemptId || undefined,
      timerMinutes: typeof quiz.timerMinutes === 'number' ? quiz.timerMinutes : undefined,
      createdAt: quiz.createdAt,
    };
  }

  private normalizeQuizAttempt(attempt: any): QuizAttempt {
    return {
      id: attempt.id || attempt._id || '',
      quiz: {
        id: attempt.quiz?.id || attempt.quiz?._id || '',
        title: attempt.quiz?.title || '',
        subject: attempt.quiz?.subject ? {
          id: attempt.quiz.subject.id || attempt.quiz.subject._id || '',
          name: attempt.quiz.subject.name || '',
          description: attempt.quiz.subject.description || '',
        } : null,
        level: attempt.quiz?.level || '',
      },
      score: attempt.score || 0,
      totalQuestions: attempt.totalQuestions || 0,
      correctAnswersCount: attempt.correctAnswersCount || 0,
      pointsEarned: attempt.pointsEarned || 0,
      startedAt: attempt.startedAt || '',
      finishedAt: attempt.finishedAt || '',
    };
  }

  private normalizeQuizAttemptDetail(attempt: any): QuizAttemptDetail {
    const baseAttempt = this.normalizeQuizAttempt(attempt);
    return {
      ...baseAttempt,
      questions: (attempt.questions || []).map((q: any) => ({
        id: q.id || q._id || '',
        text: q.text || '',
        type: q.type || 'mcq',
        options: (q.options || []).map((opt: any) => ({
          id: opt.id || opt._id || '',
          text: opt.text || '',
          isCorrect: opt.isCorrect || false,
        })),
        userAnswer: q.userAnswer ? {
          selectedOptionId: q.userAnswer.selectedOptionId || '',
          isCorrect: q.userAnswer.isCorrect || false,
        } : null,
      })),
    };
  }

  list(params: { subjectId?: string; level?: string }) {
    const query = new URLSearchParams();
    if (params.subjectId && params.subjectId.trim() !== '') {
      query.append('subjectId', params.subjectId);
    }
    if (params.level && params.level.trim() !== '') {
      query.append('level', params.level);
    }
    const qs = query.toString();
    const url = qs
      ? `${environment.apiUrl}/quizzes?${qs}`
      : `${environment.apiUrl}/quizzes`;
    return this.http.get<any[]>(url).pipe(
      map((quizzes) => quizzes.map((quiz) => this.normalizeQuiz(quiz)))
    );
  }

  get(id: string): Observable<Quiz> {
    return this.http.get<any>(`${environment.apiUrl}/quizzes/${id}`).pipe(
      map((quiz) => this.normalizeQuiz(quiz))
    );
  }

  submit(
    id: string,
    sessionId: string,
    answers: { questionId: string; selectedOptionId: string }[]
  ): Observable<SubmitQuizResponse> {
    // Validate inputs
    if (!id || !id.trim()) {
      throw new Error('Quiz ID is required');
    }
    if (!sessionId || !sessionId.trim()) {
      throw new Error('Session ID is required');
    }
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error('Answers array is required and must not be empty');
    }
    
    // Validate each answer has required fields
    const invalidAnswers = answers.filter(
      (answer) => !answer.questionId || !answer.selectedOptionId
    );
    
    if (invalidAnswers.length > 0) {
      console.error('Invalid answers detected:', invalidAnswers);
      throw new Error('All answers must have questionId and selectedOptionId');
    }
    
    const payload = {
      sessionId: sessionId.trim(),
      answers: answers.map((answer) => ({
        questionId: answer.questionId.trim(),
        selectedOptionId: answer.selectedOptionId.trim(),
      })),
    };
    
    console.log('Submitting quiz:', {
      quizId: id,
      payload,
    });
    
    return this.http.post<SubmitQuizResponse>(`${environment.apiUrl}/quizzes/${id}/submit`, payload);
  }

  /**
   * Alias for submit method (backward compatibility)
   */
  submitQuiz(
    quizId: string,
    sessionId: string,
    answers: { questionId: string; selectedOptionId: string }[]
  ): Observable<SubmitQuizResponse> {
    return this.submit(quizId, sessionId, answers);
  }

  create(payload: any) {
    return this.http.post(`${environment.apiUrl}/quizzes`, payload);
  }

  /**
   * Get all quiz attempts for the authenticated user
   * @returns Observable of quiz attempts array
   */
  getMyAttempts(): Observable<QuizAttempt[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/quizzes/attempts/my`).pipe(
      map((attempts) => attempts.map((attempt) => this.normalizeQuizAttempt(attempt)))
    );
  }

  /**
   * Get a specific quiz attempt with full details (for review)
   * @param attemptId The ID of the quiz attempt
   * @returns Observable of quiz attempt detail
   */
  getAttempt(attemptId: string): Observable<QuizAttemptDetail> {
    return this.http.get<any>(`${environment.apiUrl}/attempts/${attemptId}`).pipe(
      map((attempt) => this.normalizeQuizAttemptDetail(attempt))
    );
  }

  getStatus(quizId: string): Observable<{ taken: boolean; attemptId?: string }> {
    return this.http.get<{ taken: boolean; attemptId?: string }>(
      `${environment.apiUrl}/quizzes/${quizId}/status`
    );
  }
}
