import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { QuizAttemptDetail } from '../../types';

@Component({
  standalone: true,
  selector: 'app-quiz-review',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="card" style="text-align: center; padding: 3rem;">
          <div class="loading" style="margin: 0 auto;"></div>
          <p class="loading-text">Loading quiz review...</p>
        </div>
      } @else if (error()) {
        <div class="card error-card">
          <h3>⚠️ Error</h3>
          <p>{{ error() }}</p>
          <a routerLink="/profile" class="btn">Back to Profile</a>
        </div>
      } @else if (attempt()) {
        <div class="card review-header">
          <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2>{{ attempt()!.quiz.title }}</h2>
              <p class="quiz-meta">
                {{ attempt()!.quiz.subject?.name || 'General' }} • {{ attempt()!.quiz.level | titlecase }}
              </p>
            </div>
            <div style="text-align: right;">
              <div class="score-display">
                {{ attempt()!.correctAnswersCount }} / {{ attempt()!.totalQuestions }}
              </div>
              <div class="score-percentage">
                {{ getScorePercentage() }}%
              </div>
              <div class="points-earned">
                +{{ attempt()!.pointsEarned }} pts
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>📝 Questions & Answers</h3>
          <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;">
            @for (question of attempt()!.questions; track question.id; let i = $index) {
              <div class="question-review" [class.correct]="question.userAnswer?.isCorrect" [class.incorrect]="question.userAnswer && !question.userAnswer.isCorrect">
                <div class="question-header">
                  <span class="question-number">Question {{ i + 1 }}</span>
                  @if (question.userAnswer?.isCorrect) {
                    <span class="status-badge correct-badge">✓ Correct</span>
                  } @else if (question.userAnswer) {
                    <span class="status-badge incorrect-badge">✗ Incorrect</span>
                  }
                </div>
                <p class="question-text">{{ question.text }}</p>
                <div class="options-list">
                  @for (option of question.options; track option.id) {
                    <div class="option-item" 
                         [class.selected]="question.userAnswer?.selectedOptionId === option.id"
                         [class.correct-answer]="option.isCorrect">
                      <span class="option-marker">
                        @if (option.isCorrect) {
                          ✓
                        } @else if (question.userAnswer?.selectedOptionId === option.id) {
                          ✗
                        }
                      </span>
                      <span class="option-text">{{ option.text }}</span>
                      @if (option.isCorrect) {
                        <span class="correct-label">Correct Answer</span>
                      }
                      @if (question.userAnswer?.selectedOptionId === option.id && !option.isCorrect) {
                        <span class="your-answer-label">Your Answer</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <a routerLink="/profile" class="btn secondary">← Back to Profile</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-text {
      margin-top: 1rem;
      color: var(--text-secondary, #6b7280);
    }

    .error-card {
      text-align: center;
    background: rgba(239, 68, 68, 0.1);
      border: 2px solid #ef4444;
    }

    .error-card h3 {
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .review-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .review-header h2 {
      color: white;
      background: none;
      -webkit-text-fill-color: white;
      margin: 0 0 0.5rem 0;
    }

    .quiz-meta {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 1rem;
    }

    .score-display {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .score-percentage {
      font-size: 1.5rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 0.25rem;
    }

    .points-earned {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 0.5rem;
    }

    .question-review {
      padding: 1.5rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      background: var(--bg-card, white);
    }

    .question-review.correct {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    .question-review.incorrect {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .question-number {
      font-weight: 600;
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .correct-badge {
      background: #10b981;
      color: white;
    }

    .incorrect-badge {
      background: #ef4444;
      color: white;
    }

    .question-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-primary, #1f2937);
      margin: 0 0 1rem 0;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      background: var(--bg-card, white);
      transition: all 0.2s ease;
    }

    .option-item.selected {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
    }

    .option-item.correct-answer {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .option-item.selected.correct-answer {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.2);
    }

    .option-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .option-item.correct-answer .option-marker {
      background: #10b981;
      color: white;
    }

    .option-item.selected:not(.correct-answer) .option-marker {
      background: #ef4444;
      color: white;
    }

    .option-text {
      flex: 1;
      color: var(--text-primary, #1f2937);
    }

    .correct-label,
    .your-answer-label {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .correct-label {
      background: #10b981;
      color: white;
    }

    .your-answer-label {
      background: #ef4444;
      color: white;
    }

    [data-theme="dark"] .question-text {
      color: #f3f4f6;
    }

    [data-theme="dark"] .option-text {
      color: #f3f4f6;
    }
  `]
})
export class QuizReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizzesService = inject(QuizzesService);

  attempt = signal<QuizAttemptDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const attemptId = this.route.snapshot.paramMap.get('attemptId');
    if (!attemptId) {
      this.error.set('No attempt ID provided');
      this.loading.set(false);
      return;
    }

    this.loadAttempt(attemptId);
  }

  loadAttempt(attemptId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.quizzesService.getAttempt(attemptId).subscribe({
      next: (data) => {
        this.attempt.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading attempt:', err);
        this.error.set(err.error?.message || 'Failed to load quiz attempt');
        this.loading.set(false);
      }
    });
  }

  getScorePercentage(): number {
    const att = this.attempt();
    if (!att || att.totalQuestions === 0) return 0;
    return Math.round((att.correctAnswersCount / att.totalQuestions) * 100);
  }
}
