import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AiService } from "../../services/ai.service";
import { QuizzesService } from "../../services/quizzes.service";
import { UserService } from "../../services/user.service";
import { Quiz, QuizAttempt } from "../../types";
import { SubjectsService } from "../../services/subjects.service";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  selector: "app-quiz-selection",
  template: `
    <div class="container">
      <div class="card">
        <div
          style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;"
        >
          <div>
            <h2>{{ subjectName }}</h2>
            <p style="margin: 0.5rem 0;">
              <span class="level-badge" [class]="level">{{
                level | titlecase
              }}</span>
              level
            </p>
          </div>
        </div>
        <p class="quiz-selection-description">
          Choose a saved quiz or generate a new one with AI ✨
        </p>
        <button class="btn" (click)="generate()" [disabled]="isGenerating()">
          @if (isGenerating()) {
          <span
            class="loading"
            style="display: inline-block; margin-right: 0.5rem;"
          ></span>
          Generating... } @else { 🤖 Generate AI Quiz }
        </button>
      </div>

      <!-- Generate Random Questions Section (shown when all quizzes completed) -->
      @if (allQuizzesCompleted()) {
      <div class="card random-questions-card">
        <div class="random-questions-header">
          <h3>🎯 All Quizzes Completed!</h3>
          <p class="random-questions-description">
            You've completed all quizzes in this level. Generate random
            questions to keep practicing!
          </p>
        </div>

        <div class="level-selector-section">
          <label class="level-selector-label">Select Level:</label>
          <select
            class="level-selector"
            [(ngModel)]="selectedLevelForRandom"
            [disabled]="isGeneratingRandom()"
          >
            <option value="beginner">🌱 Beginner</option>
            <option value="middle">⭐ Middle</option>
            <option value="intermediate">🔥 Intermediate</option>
          </select>
        </div>

        <button
          class="btn btn-random"
          (click)="generateRandomQuestions()"
          [disabled]="isGeneratingRandom() || !selectedLevelForRandom"
        >
          @if (isGeneratingRandom()) {
          <span
            class="loading"
            style="display: inline-block; margin-right: 0.5rem;"
          ></span>
          Generating... } @else { 🎲 Generate Random Questions }
        </button>
      </div>
      }

      <div class="card">
        <h3>📝 Available Quizzes</h3>
        @if (quizzes().length === 0) {
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">📚</div>
          <p class="empty-state-title">No quizzes yet</p>
          <p class="empty-state-subtitle">
            Generate one to begin your learning journey!
          </p>
        </div>
        } @else {
        <div class="grid three">
          @for (quiz of quizzes(); track quiz.id) { @if (quiz.id) {
          <div class="card quiz-card" [class.completed-quiz]="quiz.hasTaken">
            <div
              style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 0.75rem;"
            >
              <h4 style="margin: 0; flex: 1;">{{ quiz.title }}</h4>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                @if (quiz.hasTaken) {
                <span class="completed-badge" title="You've completed this quiz"
                  >✓</span
                >
                }
                <span style="font-size: 1.25rem;">📋</span>
              </div>
            </div>
            <div class="quiz-question-count">
              <span>❓</span>
              <span
                >{{ quiz.questions?.length || 0 }} Question{{
                  (quiz.questions?.length || 0) !== 1 ? "s" : ""
                }}</span
              >
            </div>
            <a
              class="btn"
              [class.btn-secondary]="quiz.hasTaken"
              [routerLink]="['/quiz', quiz.id]"
              style="width: 100%; text-align: center; display: block;"
            >
              @if (quiz.hasTaken) { 🔄 Retake Quiz } @else { 🚀 Start Quiz }
            </a>
          </div>
          } }
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .quiz-selection-description {
        color: var(--text-secondary, #6b7280);
        margin-bottom: 1.5rem;
      }

      .empty-state-title {
        color: var(--text-secondary, #6b7280);
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .empty-state-subtitle {
        color: var(--text-secondary, #9ca3af);
      }

      .quiz-question-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--text-secondary, #6b7280);
        font-size: 0.9rem;
      }

      .random-questions-card {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2px solid #bae6fd;
        border-left: 5px solid #0077b5;
        margin-bottom: 2rem;
      }

      .random-questions-header {
        margin-bottom: 1.5rem;
      }

      .random-questions-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary, #1f2937);
        font-size: 1.5rem;
      }

      .random-questions-description {
        margin: 0;
        color: var(--text-secondary, #6b7280);
        font-size: 1rem;
      }

      .level-selector-section {
        margin-bottom: 1.5rem;
      }

      .level-selector-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary, #1f2937);
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      .level-selector {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid var(--border-color, #e5e7eb);
        border-radius: 10px;
        font-size: 1rem;
        background: var(--bg-card, white);
        color: var(--text-primary, #1f2937);
        cursor: pointer;
        transition: all 0.2s;
      }

      .level-selector:focus {
        outline: none;
        border-color: #0077b5;
        box-shadow: 0 0 0 3px rgba(0, 119, 181, 0.1);
      }

      .level-selector:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-random {
        width: 100%;
        background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
        color: white;
        font-size: 1.05rem;
        padding: 1rem 2rem;
        box-shadow: 0 4px 12px rgba(0, 119, 181, 0.25);
      }

      .btn-random:hover:not(:disabled) {
        background: linear-gradient(135deg, #005885 0%, #0077b5 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 119, 181, 0.4);
      }

      [data-theme="dark"] .random-questions-card {
        background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
        border-color: #3b82f6;
        border-left-color: #60a5fa;
      }

      [data-theme="dark"] .random-questions-header h3 {
        color: #f3f4f6;
      }

      [data-theme="dark"] .random-questions-description {
        color: #dbeafe;
      }

      [data-theme="dark"] .level-selector {
        background: #374151;
        border-color: #4b5563;
        color: #e5e7eb;
      }

      .completed-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        font-size: 0.875rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      .completed-quiz {
        opacity: 0.85;
        border-left: 3px solid #10b981;
      }

      .completed-quiz:hover {
        opacity: 1;
      }
    `,
  ],
})
export class QuizSelectionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizzesService = inject(QuizzesService);
  private readonly aiService = inject(AiService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly userService = inject(UserService);

  subjectId = "";
  level = "";
  subjectName = "Subject";
  quizzes = signal<Quiz[]>([]);
  attempts = signal<QuizAttempt[]>([]);
  isGenerating = signal(false);
  isGeneratingRandom = signal(false);
  selectedLevelForRandom = "beginner";
  allQuizzesCompleted = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const subjectIdParam = params.get("subjectId");
      const levelParam = params.get("level");

      // Only set if params are valid (not null, not undefined, not empty, not the string "undefined")
      this.subjectId =
        subjectIdParam &&
        subjectIdParam !== "undefined" &&
        subjectIdParam.trim() !== ""
          ? subjectIdParam
          : "";
      this.level =
        levelParam && levelParam !== "undefined" && levelParam.trim() !== ""
          ? levelParam
          : "";

      this.loadSubjectName();
      this.load();
      this.loadAttempts();
    });
  }

  load() {
    // Only pass params if they have valid values
    const queryParams: { subjectId?: string; level?: string } = {};
    if (this.subjectId) queryParams.subjectId = this.subjectId;
    if (this.level) queryParams.level = this.level;

    this.quizzesService.list(queryParams).subscribe({
      next: (data) => {
        // Log to debug if quizzes don't have id
        if (data && data.length > 0 && !data[0].id) {
          console.warn("Quizzes missing id field:", data);
        }
        this.quizzes.set(data);
        if (data[0]?.subject?.name) this.subjectName = data[0].subject.name;
        // Check if all quizzes are completed after loading quizzes
        this.checkIfAllQuizzesCompleted();
      },
      error: (err) => {
        console.error("Error loading quizzes:", err);
      },
    });
  }

  loadAttempts() {
    this.userService.getAttempts().subscribe({
      next: (data) => {
        this.attempts.set(data);
        this.checkIfAllQuizzesCompleted();
      },
      error: (err) => {
        console.error("Error loading attempts:", err);
      },
    });
  }

  checkIfAllQuizzesCompleted() {
    const quizzes = this.quizzes();
    const attempts = this.attempts();

    if (!this.subjectId || !this.level || quizzes.length === 0) {
      this.allQuizzesCompleted.set(false);
      return;
    }

    // Get completed quiz IDs for this subject and level
    const completedQuizIds = new Set(
      attempts
        .filter(
          (attempt) =>
            attempt.quiz?.subject?.id === this.subjectId &&
            attempt.quiz?.level === this.level
        )
        .map((attempt) => attempt.quiz?.id)
        .filter((id): id is string => !!id)
    );

    // Check if all quizzes in current level are completed
    const allCompleted = quizzes.every((quiz) => completedQuizIds.has(quiz.id));
    this.allQuizzesCompleted.set(allCompleted);
  }

  private loadSubjectName() {
    if (!this.subjectId) return;
    this.subjectsService.list().subscribe((subjects) => {
      const found = subjects.find((s) => s.id === this.subjectId);
      if (found) this.subjectName = found.name;
    });
  }

  generate() {
    this.isGenerating.set(true);
    this.aiService
      .generateQuiz(this.subjectName, this.level || "beginner")
      .subscribe({
        next: () => {
          this.load();
          this.isGenerating.set(false);
        },
        error: (err) => {
          console.error("Error generating quiz:", err);
          this.isGenerating.set(false);
        },
      });
  }

  generateRandomQuestions() {
    if (!this.selectedLevelForRandom || !this.subjectId) {
      return;
    }

    this.isGeneratingRandom.set(true);
    this.aiService
      .generateRandomQuestions(this.subjectName, this.selectedLevelForRandom)
      .subscribe({
        next: () => {
          this.load();
          this.loadAttempts();
          this.isGeneratingRandom.set(false);
        },
        error: (err) => {
          console.error("Error generating random questions:", err);
          this.isGeneratingRandom.set(false);
        },
      });
  }
}
