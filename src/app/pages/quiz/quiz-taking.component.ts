import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizzesService } from '../../services/quizzes.service';
import { NotificationService } from '../../user/services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Quiz, SubmitQuizResponse } from '../../types';
import { QuizShareCardComponent } from '../../quiz/components/quiz-share-card/quiz-share-card.component';
import { QuizSharePayload } from '../../quiz/models/share.models';

@Component({
  standalone: true,
  selector: 'app-quiz-taking',
  imports: [CommonModule, FormsModule, RouterModule, QuizShareCardComponent],
  template: `
    <div class="container">
      @if (!submitResult() && quiz()) {
        <!-- Quiz Taking View -->
        <div class="card quiz-header">
          <div class="quiz-header-content">
            <div>
        <h2>{{ quiz()?.title }}</h2>
              <p class="quiz-subject-info">
                <span class="subject-name">{{ quiz()?.subject?.name }}</span>
                <span class="level-badge" [class]="quiz()?.level">
                  {{ quiz()?.level | titlecase }}
                </span>
              </p>
            </div>
            <div class="progress-section">
              <div class="progress-label">Progress</div>
              <div class="progress-value">
                {{ getAnsweredCount() }} / {{ quiz()?.questions?.length || 0 }}
              </div>
            </div>
          </div>
      </div>

      @for (question of quiz()?.questions; track question.id; let idx = $index) {
          <div class="card question-card">
            <div class="question-content">
              <div class="question-number">{{ idx + 1 }}</div>
              <div class="question-body">
                <h4 class="question-text">{{ question.text }}</h4>
                <div class="options-list">
            @for (option of question.options; track option.id) {
                    <label class="option-label" [class.selected]="selected[question.id] === option.id">
                <input
                  type="radio"
                  name="q{{ question.id }}"
                  [value]="option.id"
                  [(ngModel)]="selected[question.id]"
                        class="option-input"
                />
                      <span class="option-text">{{ option.text }}</span>
              </label>
            }
                </div>
              </div>
            </div>
          </div>
        }

        <div class="card submit-card">
          <button 
            class="btn submit-btn" 
            (click)="submit()" 
            [disabled]="isSubmitting() || getAnsweredCount() < (quiz()?.questions?.length || 0)">
            @if (isSubmitting()) {
              <span class="loading-spinner"></span>
              Submitting...
            } @else {
              ✅ Submit Quiz
            }
          </button>
          @if (getAnsweredCount() < (quiz()?.questions?.length || 0)) {
            <p class="submit-warning">
              Please answer all {{ quiz()?.questions?.length || 0 }} questions before submitting
            </p>
          }
          @if (submitError()) {
            <p class="error-message">{{ submitError() }}</p>
          }
        </div>
      }

      @if (submitResult()) {
        <!-- Results View -->
        <div class="result-container">
          <!-- Summary Card -->
          <div class="card result-summary-card">
            <div class="result-header">
              <div class="result-emoji">
                @if (getScorePercentage() >= 80) {
                  🎉
                } @else if (getScorePercentage() >= 60) {
                  👍
                } @else {
                  📚
                }
              </div>
              <h2 class="result-title">Quiz Complete!</h2>
              <div class="score-display">
                {{ submitResult()!.score }} / {{ submitResult()!.totalQuestions }}
              </div>
              <div class="score-percentage">{{ getScorePercentage() }}% Correct</div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ submitResult()!.correctAnswersCount }}</div>
                <div class="stat-label">Correct Answers</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ submitResult()!.pointsEarned }}</div>
                <div class="stat-label">Points Earned</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ submitResult()!.updatedUserTotalPoints }}</div>
                <div class="stat-label">Total Points</div>
              </div>
            </div>
          </div>

          <!-- Share Card -->
          @if (submitResult()) {
            <app-quiz-share-card
              [attemptId]="getAttemptId()"
              [summary]="computedSummaryFromQuizAndResult()"
              [showAutoPostOption]="false"
            />
          }

          <!-- Wrong Answers Section -->
          @if (submitResult()!.wrongAnswers && submitResult()!.wrongAnswers.length > 0) {
            <div class="wrong-answers-section">
              <h3 class="section-title">
                <span class="title-icon">📝</span>
                Review Your Mistakes
              </h3>
              
              @for (wrongAnswer of submitResult()!.wrongAnswers; track wrongAnswer.questionId; let idx = $index) {
                <div class="card wrong-answer-card">
                  <div class="wrong-answer-header">
                    <div class="question-number-small">{{ getWrongAnswerQuestionNumber(wrongAnswer.questionId) }}</div>
                    <h4 class="wrong-question-text">{{ wrongAnswer.questionText }}</h4>
                  </div>

                  <div class="answer-feedback">
                    <div class="feedback-item incorrect">
                      <span class="feedback-label">❌ Your Answer:</span>
                      <span class="feedback-value">{{ getOptionText(wrongAnswer.questionId, wrongAnswer.selectedOptionId) }}</span>
                    </div>
                    <div class="feedback-item correct">
                      <span class="feedback-label">✅ Correct Answer:</span>
                      <span class="feedback-value">{{ getOptionText(wrongAnswer.questionId, wrongAnswer.correctOptionId) }}</span>
                    </div>
                  </div>

                  @if (wrongAnswer.explanation) {
                    <div class="explanation">
                      <strong>Explanation:</strong>
                      <p>{{ wrongAnswer.explanation }}</p>
                    </div>
                  }

                  <!-- Suggested Articles (Collapsible) -->
                  @if (wrongAnswer.suggestedArticles && wrongAnswer.suggestedArticles.length > 0) {
                    <div class="articles-section">
                      <button 
                        class="articles-toggle"
                        (click)="toggleArticles(wrongAnswer.questionId)"
                        [attr.aria-expanded]="expandedArticles().has(wrongAnswer.questionId)">
                        <span class="toggle-icon" [class.expanded]="expandedArticles().has(wrongAnswer.questionId)">
                          ▶
                        </span>
                        <span class="toggle-text">
                          {{ expandedArticles().has(wrongAnswer.questionId) ? 'Hide' : 'Show' }} Learning Resources 
                          ({{ wrongAnswer.suggestedArticles.length }})
                        </span>
                      </button>

                      @if (expandedArticles().has(wrongAnswer.questionId)) {
                        <div class="articles-list">
                          @for (article of wrongAnswer.suggestedArticles; track article.id) {
                            <a 
                              [href]="article.url" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              class="article-card">
                              <div class="article-header">
                                <h5 class="article-title">{{ article.title }}</h5>
                                @if (article.provider) {
                                  <span class="article-provider">{{ article.provider }}</span>
                                }
                              </div>
                              <div class="article-meta">
                                @if (article.estimatedReadingTimeMinutes) {
                                  <span class="reading-time">⏱️ {{ article.estimatedReadingTimeMinutes }} min read</span>
                                }
                                @if (article.subject) {
                                  <span class="article-subject">{{ article.subject }}</span>
                                }
                                @if (article.level) {
                                  <span class="article-level">{{ article.level }}</span>
                                }
                              </div>
                              <div class="article-link">
                                Read Article →
                              </div>
                            </a>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="card perfect-score-card">
              <div class="perfect-score-icon">🌟</div>
              <h3>Perfect Score!</h3>
              <p>You got all questions correct. Great job!</p>
            </div>
          }

          <!-- Action Buttons -->
          <div class="result-actions">
            <button class="btn secondary" (click)="resetQuiz()">Take Another Quiz</button>
            <button class="btn primary" routerLink="/dashboard">Back to Dashboard</button>
          </div>
        </div>
      }

      @if (!quiz() && !submitResult()) {
        <div class="card loading-card">
          <div class="loading-spinner-large"></div>
          <p>Loading quiz...</p>
      </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* Quiz Header */
    .quiz-header {
      margin-bottom: 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-card, white);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      transition: box-shadow 0.3s ease;
    }

    .quiz-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--bg-card, white);
      border-radius: 16px;
      z-index: -1;
      backdrop-filter: blur(10px);
    }

    .quiz-header-content {
      display: flex;
      justify-content: space-between;
      align-items: start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .quiz-subject-info {
      margin-top: 0.5rem;
      color: var(--text-secondary, #6b7280);
    }

    .subject-name {
      font-weight: 600;
    }

    .level-badge {
      margin-left: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    .level-badge.beginner {
      background: #d1fae5;
      color: #065f46;
    }

    .level-badge.middle {
      background: #dbeafe;
      color: #1e40af;
    }

    .level-badge.intermediate {
      background: #fef3c7;
      color: #92400e;
    }

    .progress-section {
      text-align: right;
    }

    .progress-label {
      font-size: 0.9rem;
      color: var(--text-secondary, #6b7280);
    }

    .progress-value {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Question Cards */
    .question-card {
      margin-bottom: 1.5rem;
    }

    .question-content {
      display: flex;
      align-items: start;
      gap: 1rem;
    }

    .question-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .question-body {
      flex: 1;
    }

    .question-text {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      line-height: 1.6;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option-label {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 10px;
      transition: all 0.3s ease;
      cursor: pointer;
      background: var(--bg-card, white);
    }

    .option-label:hover {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.05);
      transform: translateX(4px);
    }

    .option-label.selected {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.1);
    }

    .option-input {
      margin-right: 0.75rem;
      cursor: pointer;
    }

    .option-text {
      flex: 1;
      color: var(--text-primary, #1f2937);
      font-size: 1rem;
      line-height: 1.5;
    }

    /* Submit Card */
    .submit-card {
      text-align: center;
      padding: 2rem;
    }

    .submit-btn {
      min-width: 200px;
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }

    .submit-warning {
      margin-top: 1rem;
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
    }

    .error-message {
      margin-top: 1rem;
      color: #ef4444;
      font-size: 0.9rem;
    }

    /* Results */
    .result-container {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 2rem;
    }

    .result-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .result-emoji {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .result-title {
      margin: 0 0 1rem 0;
      font-size: 2rem;
      color: white;
    }

    .score-display {
      font-size: 3rem;
      font-weight: 700;
      margin: 1rem 0;
    }

    .score-percentage {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    /* Wrong Answers */
    .wrong-answers-section {
      margin-bottom: 2rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
    }

    .title-icon {
      font-size: 1.75rem;
    }

    .wrong-answer-card {
      margin-bottom: 2rem;
      border-left: 5px solid #ef4444;
      padding: 1.5rem;
      background: var(--bg-card, white);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .wrong-answer-header {
      display: flex;
      align-items: start;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .question-number-small {
      background: #ef4444;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    .wrong-question-text {
      flex: 1;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      line-height: 1.6;
    }

    .answer-feedback {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 12px;
      border: 1px solid var(--border-color, #e5e7eb);
    }

    .feedback-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      min-height: 60px;
    }

    .feedback-item.incorrect {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      border: 1px solid #fecaca;
    }

    .feedback-item.correct {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      border: 1px solid #a7f3d0;
    }

    .feedback-label {
      font-weight: 700;
      font-size: 1rem;
      min-width: 140px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .feedback-value {
      flex: 1;
      color: var(--text-primary, #1f2937);
      font-size: 1.05rem;
      font-weight: 500;
      line-height: 1.6;
      padding: 0.25rem 0;
    }

    .explanation {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 12px;
      border: 1px solid var(--border-color, #e5e7eb);
    }

    .explanation strong {
      display: block;
      margin-bottom: 0.75rem;
      color: var(--text-primary, #1f2937);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .explanation p {
      margin: 0;
      color: var(--text-primary, #1f2937);
      line-height: 1.8;
      font-size: 1rem;
    }

    /* Articles Section */
    .articles-section {
      margin-top: 1rem;
      border-top: 2px solid var(--border-color, #e5e7eb);
      padding-top: 1rem;
    }

    .articles-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--bg-secondary, #f3f4f6);
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-primary, #1f2937);
      transition: all 0.2s;
    }

    .articles-toggle:hover {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .toggle-icon {
      transition: transform 0.3s ease;
      font-size: 0.75rem;
    }

    .toggle-icon.expanded {
      transform: rotate(90deg);
    }

    .articles-list {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .article-card {
      display: block;
      padding: 1.5rem;
      background: var(--bg-card, white);
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
    }

    .article-card:hover {
      border-color: var(--primary-color, #6366f1);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .article-title {
      flex: 1;
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    .article-provider {
      padding: 0.25rem 0.75rem;
      background: var(--primary-color, #6366f1);
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary, #6b7280);
      font-weight: 500;
    }

    .reading-time,
    .article-subject,
    .article-level {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .article-level {
      padding: 0.2rem 0.5rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .article-link {
      color: var(--primary-color, #6366f1);
      font-weight: 700;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .perfect-score-card {
      text-align: center;
      padding: 3rem 2rem;
      margin-bottom: 2rem;
    }

    .perfect-score-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .perfect-score-card h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #1f2937);
    }

    .result-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn.primary {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .btn.secondary {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    .loading-card {
      text-align: center;
      padding: 3rem;
    }

    .loading-spinner,
    .loading-spinner-large {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-spinner-large {
      width: 40px;
      height: 40px;
      border-width: 4px;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark Mode */
    [data-theme="dark"] .option-label:hover {
      background: rgba(129, 140, 248, 0.1);
    }

    [data-theme="dark"] .level-badge {
      background: #374151;
      color: #f3f4f6;
    }

    [data-theme="dark"] .feedback-item.incorrect {
      background: #7f1d1d;
      border-color: #991b1b;
    }

    [data-theme="dark"] .feedback-item.correct {
      background: #064e3b;
      border-color: #047857;
    }

    [data-theme="dark"] .feedback-value {
      color: #f3f4f6;
    }

    [data-theme="dark"] .explanation {
      background: #1f2937;
      border-color: #374151;
    }

    [data-theme="dark"] .explanation p {
      color: #e5e7eb;
    }

    [data-theme="dark"] .answer-feedback {
      background: #1f2937;
      border-color: #374151;
    }

    [data-theme="dark"] .wrong-question-text {
      color: #f3f4f6;
    }

    [data-theme="dark"] .article-card {
      background: #1f2937;
      border-color: #374151;
    }

    [data-theme="dark"] .article-title {
      color: #f3f4f6;
    }

    [data-theme="dark"] .articles-toggle {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    [data-theme="dark"] .articles-toggle:hover {
      background: #374151;
      border-color: #4b5563;
    }

    [data-theme="dark"] .quiz-header {
      background: #1f2937;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    [data-theme="dark"] .quiz-header::before {
      background: #1f2937;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }

      .quiz-header-content {
        flex-direction: column;
      }

      .progress-section {
        text-align: left;
      }

      .result-actions {
        flex-direction: column;
      }

      .result-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class QuizTakingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizzesService = inject(QuizzesService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  quiz = signal<Quiz | null>(null);
  submitResult = signal<SubmitQuizResponse | null>(null);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  selected: Record<string, string> = {};
  expandedArticles = signal<Set<string>>(new Set());

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('quizId');
      if (id) this.loadQuiz(id);
    });
  }

  loadQuiz(id: string) {
    this.quizzesService.get(id).subscribe({
      next: (q) => this.quiz.set(q),
      error: (err) => {
        this.submitError.set('Failed to load quiz. Please try again.');
        console.error('Error loading quiz:', err);
      }
    });
  }

  getAnsweredCount(): number {
    const quiz = this.quiz();
    if (!quiz) return 0;
    return Object.keys(this.selected).filter(key => this.selected[key]).length;
  }

  getScorePercentage(): number {
    const result = this.submitResult();
    if (!result) return 0;
    return Math.round((result.score / result.totalQuestions) * 100);
  }

  getWrongAnswerQuestionNumber(questionId: string): number {
    const quiz = this.quiz();
    if (!quiz) return 0;
    const index = quiz.questions.findIndex(q => q.id === questionId);
    return index + 1;
  }

  getOptionText(questionId: string, optionId: string): string {
    const quiz = this.quiz();
    if (!quiz) return '';
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return '';
    const option = question.options.find(opt => opt.id === optionId);
    return option?.text || '';
  }

  getAttemptId(): string {
    const result = this.submitResult();
    const quiz = this.quiz();
    
    // Use attemptId from backend if available, otherwise generate a temporary one
    if (result?.attemptId) {
      return result.attemptId;
    }
    
    // Generate a temporary attemptId using quizId and timestamp
    // This allows the share feature to work even if backend doesn't return attemptId yet
    if (quiz?.id) {
      return `temp-${quiz.id}-${Date.now()}`;
    }
    
    return `temp-${Date.now()}`;
  }

  computedSummaryFromQuizAndResult(): QuizSharePayload {
    const result = this.submitResult();
    const quiz = this.quiz();
    
    if (!result || !quiz) {
      throw new Error('Result or quiz is not available');
    }

    return {
      quizId: quiz.id,
      attemptId: this.getAttemptId(),
      score: result.score,
      correctAnswersCount: result.correctAnswersCount,
      totalQuestions: result.totalQuestions,
      pointsEarned: result.pointsEarned,
      subject: quiz.subject?.name,
      level: quiz.level,
      finishedAt: new Date().toISOString(),
    };
  }

  toggleArticles(questionId: string) {
    const expanded = new Set(this.expandedArticles());
    if (expanded.has(questionId)) {
      expanded.delete(questionId);
    } else {
      expanded.add(questionId);
    }
    this.expandedArticles.set(expanded);
  }

  resetQuiz() {
    this.submitResult.set(null);
    this.selected = {};
    this.expandedArticles.set(new Set());
    this.submitError.set(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submit() {
    const quiz = this.quiz();
    if (!quiz) return;
    
    this.isSubmitting.set(true);
    this.submitError.set(null);
    
    const answers = quiz.questions
      .map((q) => {
        const questionId = q.id;
        const selectedOptionId = this.selected[questionId];
        
        if (!questionId || !questionId.trim() || !selectedOptionId || !selectedOptionId.trim()) {
          return null;
        }
        
        return {
          questionId: questionId.trim(),
          selectedOptionId: selectedOptionId.trim(),
        };
      })
      .filter((answer): answer is { questionId: string; selectedOptionId: string } => answer !== null);
    
    if (answers.length !== quiz.questions.length) {
      this.submitError.set(`Please answer all ${quiz.questions.length} questions.`);
      this.isSubmitting.set(false);
      return;
    }
    
    this.quizzesService.submit(quiz.id, answers).subscribe({
      next: (res) => {
        this.submitResult.set(res);
        this.isSubmitting.set(false);
        
        // Update user's total points in AuthService
        this.authService.updateUserPoints(res.updatedUserTotalPoints);
        
        // Also refresh profile from backend to ensure consistency
        this.authService.refreshProfile().subscribe({
          next: (user) => {
            console.log('User profile refreshed, totalPoints:', user.totalPoints);
          },
          error: (err) => {
            console.warn('Failed to refresh profile, but points updated locally:', err);
          }
        });
        
        // Show notification
        this.notificationService.showQuizComplete(
          res.score,
          res.totalQuestions,
          res.pointsEarned
        );
        
        // Scroll to results
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        this.submitError.set(err.error?.message || 'Failed to submit quiz. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
