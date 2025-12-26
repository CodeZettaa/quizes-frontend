import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SubjectStat {
  subject: string;
  quizzesTaken: number;
  averageScore: number;
  totalPoints: number;
}

@Component({
  selector: 'app-subject-stats-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subject-stats-list">
      <h3 class="section-title">Subject Performance</h3>
      @if (perSubjectStats().length === 0) {
        <div class="empty-state">
          <p>No subject statistics available yet.</p>
        </div>
      } @else {
        <div class="stats-grid">
          @for (stat of perSubjectStats(); track stat.subject) {
            <div class="subject-card">
              <div class="subject-header">
                <h4 class="subject-name">{{ stat.subject }}</h4>
                <span class="subject-points">+{{ stat.totalPoints }} pts</span>
              </div>
              <div class="subject-stats">
                <div class="stat-item">
                  <span class="stat-label">Quizzes</span>
                  <span class="stat-value">{{ stat.quizzesTaken }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Avg Score</span>
                  <span class="stat-value score-value" [class]="getScoreClass(stat.averageScore)">
                    {{ stat.averageScore }}%
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .subject-stats-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary, #6b7280);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .subject-card {
      background: var(--bg-card, white);
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }

    .subject-card:hover {
      border-color: var(--primary-color, #6366f1);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
    }

    .subject-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .subject-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .subject-points {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
    }

    .subject-stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
    }

    .score-value {
      &.excellent {
        color: #10b981;
      }
      &.good {
        color: #3b82f6;
      }
      &.average {
        color: #f59e0b;
      }
      &.poor {
        color: #ef4444;
      }
    }

    [data-theme="dark"] .subject-card {
      background: #1f2937;
      border-color: #374151;
    }
  `]
})
export class SubjectStatsListComponent {
  perSubjectStats = input.required<SubjectStat[]>();

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
}

