import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AttemptService } from "../../services/attempt.service";
import { QuizShareCardComponent } from "../../quiz/components/quiz-share-card/quiz-share-card.component";
import { QuizSharePayload } from "../../quiz/models/share.models";
import { AttemptDetails } from "../../types";

@Component({
  standalone: true,
  selector: "app-attempt-details",
  imports: [CommonModule, RouterLink, QuizShareCardComponent],
  template: `
    <div class="container">
      @if (notice()) {
        <div class="card notice-card">
          {{ notice() }}
        </div>
      }

      @if (loading()) {
        <div class="card loading-card">
          <div class="loading"></div>
          <p>Loading attempt...</p>
        </div>
      } @else if (error()) {
        <div class="card error-card">
          <h3>⚠️ Error</h3>
          <p>{{ error() }}</p>
          <a routerLink="/profile" class="btn secondary">Back to Profile</a>
        </div>
      } @else if (attempt()) {
        <div class="card summary-card">
          <div class="summary-header">
            <div>
              <h2>{{ attempt()!.quizTitle }}</h2>
              <p class="summary-meta">
                {{ attempt()!.subject?.name || 'General' }} • {{ attempt()!.level | titlecase }}
              </p>
            </div>
            <div class="summary-score">
              <div class="score-main">{{ attempt()!.correctAnswersCount }} / {{ attempt()!.totalQuestions }}</div>
              <div class="score-sub">{{ getScorePercentage() }}% correct</div>
              <div class="score-points">+{{ attempt()!.pointsEarned }} pts</div>
            </div>
          </div>
          <div class="summary-footer">
            Completed {{ formatDate(attempt()!.finishedAt) }}
          </div>
        </div>

        @if (attempt()!.questions?.length) {
          <div class="card">
            <h3>📝 Questions & Answers</h3>
            <div class="qa-list">
              @for (question of attempt()!.questions; track question.id; let i = $index) {
                <div class="qa-item" [class.correct]="question.userAnswer?.isCorrect" [class.incorrect]="question.userAnswer && !question.userAnswer.isCorrect">
                  <div class="qa-header">
                    <span class="qa-number">Question {{ i + 1 }}</span>
                    @if (question.userAnswer?.isCorrect) {
                      <span class="status-badge correct-badge">✓ Correct</span>
                    } @else if (question.userAnswer) {
                      <span class="status-badge incorrect-badge">✗ Incorrect</span>
                    }
                  </div>
                  <p class="qa-text">{{ question.text }}</p>
                  <div class="qa-options">
                    @for (option of question.options; track option.id) {
                      <div class="qa-option"
                        [class.selected]="question.userAnswer?.selectedOptionId === option.id"
                        [class.correct-answer]="option.isCorrect">
                        <span class="qa-marker">
                          @if (option.isCorrect) {
                            ✓
                          } @else if (question.userAnswer?.selectedOptionId === option.id) {
                            ✗
                          }
                        </span>
                        <span class="qa-option-text">{{ option.text }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="card">
          <h3>🔗 Share Result</h3>
          <app-quiz-share-card
            [attemptId]="attempt()!.attemptId"
            [summary]="buildShareSummary(attempt()!)"
            [showAutoPostOption]="false"
          />
        </div>

        <div class="actions">
          <a routerLink="/profile" class="btn secondary">← Back to Profile</a>
          <a routerLink="/dashboard" class="btn">Browse Quizzes</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .notice-card {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #92400e;
      font-weight: 600;
    }

    .loading-card,
    .error-card {
      text-align: center;
    }

    .summary-card {
      background: var(--bg-card, white);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .summary-meta {
      color: var(--text-secondary, #6b7280);
      margin: 0.5rem 0 0;
    }

    .summary-score {
      text-align: right;
    }

    .score-main {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color, #6366f1);
    }

    .score-sub {
      color: var(--text-secondary, #6b7280);
      font-weight: 600;
    }

    .score-points {
      color: var(--text-secondary, #6b7280);
      margin-top: 0.25rem;
    }

    .summary-footer {
      margin-top: 1rem;
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
    }

    .qa-list {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .qa-item {
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      padding: 1rem;
      background: var(--bg-card, white);
    }

    .qa-item.correct {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    .qa-item.incorrect {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .qa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .qa-number {
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

    .qa-text {
      margin: 0 0 0.75rem 0;
      color: var(--text-primary, #1f2937);
    }

    .qa-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .qa-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      padding: 0.75rem;
      background: var(--bg-card, white);
    }

    .qa-option.selected {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.08);
    }

    .qa-option.correct-answer {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .qa-marker {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.85rem;
      background: var(--bg-secondary, #f3f4f6);
    }

    .qa-option.correct-answer .qa-marker {
      background: #10b981;
      color: white;
    }

    .qa-option.selected:not(.correct-answer) .qa-marker {
      background: #ef4444;
      color: white;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
  `],
})
export class AttemptDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attemptService = inject(AttemptService);

  attempt = signal<AttemptDetails | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);

  ngOnInit() {
    const attemptId = this.route.snapshot.paramMap.get("attemptId");
    const stateMessage =
      this.router.getCurrentNavigation()?.extras?.state?.["message"] ||
      history.state?.message;

    if (stateMessage) {
      this.notice.set(stateMessage);
    }

    if (!attemptId) {
      this.error.set("No attempt ID provided");
      this.loading.set(false);
      return;
    }

    this.loadAttempt(attemptId);
  }

  loadAttempt(attemptId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.attemptService.getAttempt(attemptId).subscribe({
      next: (data) => {
        this.attempt.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to load attempt");
        this.loading.set(false);
      },
    });
  }

  getScorePercentage(): number {
    const attempt = this.attempt();
    if (!attempt || !attempt.totalQuestions) return 0;
    return Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100);
  }

  formatDate(dateString: string): string {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  }

  buildShareSummary(attempt: AttemptDetails): QuizSharePayload {
    const validLevels = ['beginner', 'middle', 'intermediate'] as const;
    const level = attempt.level && validLevels.includes(attempt.level as any)
      ? (attempt.level as 'beginner' | 'middle' | 'intermediate')
      : undefined;
    
    return {
      quizId: attempt.quizId,
      attemptId: attempt.attemptId,
      score: attempt.score,
      correctAnswersCount: attempt.correctAnswersCount,
      totalQuestions: attempt.totalQuestions,
      pointsEarned: attempt.pointsEarned,
      subject: attempt.subject?.name,
      level,
      finishedAt: attempt.finishedAt,
    };
  }
}
