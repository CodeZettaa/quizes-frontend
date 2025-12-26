import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserStats } from '../../../types';

@Component({
  selector: 'app-user-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-summary-card">
      <div class="avatar-section">
        @if (user().avatarUrl) {
          <img [src]="user().avatarUrl" [alt]="user().name" class="avatar" />
        } @else {
          <div class="avatar-placeholder">
            <span class="avatar-icon">👤</span>
          </div>
        }
      </div>
      
      <div class="user-info">
        <h2 class="user-name">{{ user().name }}</h2>
        <p class="user-email">{{ user().email }}</p>
        @if (user().bio) {
          <p class="user-bio">{{ user().bio }}</p>
        }
        
        <div class="points-badge">
          <span class="points-icon">🏆</span>
          <span class="points-value">{{ user().totalPoints }}</span>
          <span class="points-label">Points</span>
        </div>
      </div>

      @if (stats()) {
        <div class="quick-stats">
          <div class="stat-chip">
            <span class="stat-icon">📝</span>
            <span class="stat-value">{{ stats()!.totalQuizzesTaken }}</span>
            <span class="stat-label">Quizzes</span>
          </div>
          <div class="stat-chip">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">{{ stats()!.streakDays }}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-summary-card {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.1));
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.5rem;
    }

    .avatar-section {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--primary-color, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary, #f3f4f6);
    }

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .avatar-icon {
      font-size: 3rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-name {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
    }

    .user-email {
      margin: 0;
      color: var(--text-secondary, #6b7280);
      font-size: 1rem;
    }

    .user-bio {
      margin: 0.5rem 0 0 0;
      color: var(--text-secondary, #6b7280);
      font-size: 0.95rem;
      max-width: 400px;
    }

    .points-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50px;
      color: white;
      font-weight: 600;
    }

    .points-icon {
      font-size: 1.5rem;
    }

    .points-value {
      font-size: 1.5rem;
    }

    .points-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .quick-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .stat-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 12px;
      min-width: 80px;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    [data-theme="dark"] .user-summary-card {
      background: #1f2937;
    }

    [data-theme="dark"] .stat-chip {
      background: #111827;
    }
  `]
})
export class UserSummaryCardComponent {
  user = input.required<User>();
  stats = input<UserStats | undefined>();
}

