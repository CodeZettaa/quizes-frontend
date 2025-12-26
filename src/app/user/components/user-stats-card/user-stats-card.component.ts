import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStats } from '../../../types';
import { SubjectStatsListComponent } from '../subject-stats-list/subject-stats-list.component';

@Component({
  selector: 'app-user-stats-card',
  standalone: true,
  imports: [CommonModule, SubjectStatsListComponent],
  template: `
    <div class="user-stats-card">
      <h3 class="card-title">Statistics</h3>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().totalQuizzesTaken }}</div>
            <div class="stat-label">Quizzes Taken</div>
          </div>
        </div>
        
        <div class="stat-box">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().totalCorrectAnswers }}</div>
            <div class="stat-label">Correct Answers</div>
          </div>
        </div>
        
        <div class="stat-box">
          <div class="stat-icon">❓</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().totalQuestionsAnswered }}</div>
            <div class="stat-label">Questions Answered</div>
          </div>
        </div>
        
        <div class="stat-box">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats().streakDays }}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      @if (stats().perSubjectStats.length > 0) {
        <app-subject-stats-list [perSubjectStats]="stats().perSubjectStats" />
      }
    </div>
  `,
  styles: [`
    .user-stats-card {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.1));
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .card-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .stat-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary, #6b7280);
    }

    [data-theme="dark"] .user-stats-card {
      background: #1f2937;
    }

    [data-theme="dark"] .stat-box {
      background: #111827;
    }
  `]
})
export class UserStatsCardComponent {
  stats = input.required<UserStats>();
}

