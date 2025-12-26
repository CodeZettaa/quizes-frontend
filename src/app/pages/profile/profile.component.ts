import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, UpdateProfileRequest, ProfileStats } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { QuizzesService } from '../../services/quizzes.service';
import { QuizAttempt, User } from '../../types';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <!-- Profile Header -->
      <div class="card profile-header">
        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2>{{ user()?.name || 'User' }}</h2>
            <p class="user-email-text">{{ user()?.email }}</p>
            <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.5rem;">🏆</span>
              <span style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                {{ user()?.totalPoints || 0 }} Points
              </span>
            </div>
          </div>
          <div>
            <button class="btn secondary" (click)="toggleEditMode()">
              {{ isEditing() ? '❌ Cancel' : '✏️ Edit Profile' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      @if (isEditing()) {
        <div class="card">
          <h3>Edit Profile</h3>
          <form (ngSubmit)="updateProfile()">
            <label>Name</label>
            <input
              class="input"
              [(ngModel)]="editForm.name"
              name="name"
              placeholder="Your name"
              required
            />

            <label>Email</label>
            <input
              class="input"
              type="email"
              [(ngModel)]="editForm.email"
              name="email"
              placeholder="Your email"
              required
            />

            <label>New Password (leave blank to keep current)</label>
            <input
              class="input"
              type="password"
              [(ngModel)]="editForm.password"
              name="password"
              placeholder="New password"
            />

            <label>Current Password (required if changing password)</label>
            <input
              class="input"
              type="password"
              [(ngModel)]="editForm.currentPassword"
              name="currentPassword"
              placeholder="Current password"
            />

            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              <button class="btn" type="submit" [disabled]="isUpdating()">
                @if (isUpdating()) {
                  <span class="loading" style="display: inline-block; margin-right: 0.5rem;"></span>
                  Updating...
                } @else {
                  💾 Save Changes
                }
              </button>
            </div>

            @if (updateError()) {
              <p class="error-message">{{ updateError() }}</p>
            }
            @if (updateSuccess()) {
              <p class="success-message">{{ updateSuccess() }}</p>
            }
          </form>
        </div>
      }

      <!-- Statistics -->
      @if (stats()) {
        <div class="card">
          <h3>📊 Statistics</h3>
          <div class="grid three" style="margin-top: 1rem;">
            <div style="text-align: center; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
              <div style="font-size: 2rem; font-weight: 700; color: #6366f1;">{{ stats()?.totalAttempts || 0 }}</div>
              <div class="stat-label">Total Attempts</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
              <div style="font-size: 2rem; font-weight: 700; color: #10b981;">{{ stats()?.averageScore || 0 }}%</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
              <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">{{ stats()?.bestScore || 0 }}%</div>
              <div class="stat-label">Best Score</div>
            </div>
          </div>
        </div>
      }

      <!-- Recent Quiz Attempts -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>📝 Recent Quiz Attempts</h3>
          @if (attempts().length > 0) {
            <a routerLink="/leaderboard" class="btn secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
              🏆 View Leaderboard
            </a>
          }
        </div>
        
        @if (isLoading()) {
          <div style="text-align: center; padding: 2rem;">
            <div class="loading" style="margin: 0 auto;"></div>
            <p class="loading-text">Loading attempts...</p>
          </div>
        } @else if (attempts().length === 0) {
          <div style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📚</div>
            <p class="empty-state-title">
              No quiz attempts yet
            </p>
            <p class="empty-state-subtitle">
              Start taking quizzes to see your attempts here!
            </p>
            <a routerLink="/dashboard" class="btn" style="margin-top: 1rem; display: inline-block;">
              🚀 Start Quiz
            </a>
          </div>
        } @else {
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            @for (attempt of attempts(); track attempt.id) {
              <div class="attempt-card" [routerLink]="['/quiz', 'attempt', attempt.id, 'review']">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">{{ attempt.quiz.title }}</h4>
                    <p class="attempt-subject">
                      {{ attempt.quiz.subject?.name || 'General' }} - {{ attempt.quiz.level | titlecase }}
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                      {{ attempt.correctAnswersCount }} / {{ attempt.totalQuestions }}
                    </div>
                    <div class="attempt-score-details">
                      {{ getScorePercentage(attempt) }}% • +{{ attempt.pointsEarned }} pts
                    </div>
                    <div class="attempt-date">
                      {{ formatDate(attempt.finishedAt) }}
                    </div>
                  </div>
                </div>
                <div class="attempt-footer">
                  <div class="attempt-stats">
                    <span>✅ {{ attempt.correctAnswersCount }} Correct</span>
                    <span>❌ {{ attempt.totalQuestions - attempt.correctAnswersCount }} Incorrect</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .user-email-text {
      color: var(--text-secondary, #6b7280);
      margin-top: 0.5rem;
    }

    .error-message {
      color: #ef4444;
      margin-top: 1rem;
    }

    .success-message {
      color: #10b981;
      margin-top: 1rem;
    }

    .stat-label {
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .loading-text {
      margin-top: 1rem;
      color: var(--text-secondary, #6b7280);
    }

    .empty-state-title {
      color: var(--text-secondary, #6b7280);
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .empty-state-subtitle {
      color: var(--text-secondary, #9ca3af);
    }

    .attempt-card {
      padding: 1rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .attempt-card:hover {
      border-color: var(--primary-color, #6366f1);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
    }

    .attempt-subject {
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
      margin: 0;
    }

    .attempt-score-details {
      color: var(--text-secondary, #6b7280);
      font-size: 0.85rem;
    }

    .attempt-date {
      color: var(--text-secondary, #9ca3af);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .attempt-footer {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .attempt-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--text-secondary, #6b7280);
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .profile-header h2 {
      color: white;
      background: none;
      -webkit-text-fill-color: white;
    }

    .profile-header p {
      color: rgba(255, 255, 255, 0.9);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private quizzesService = inject(QuizzesService);

  user = signal<User | null>(null);
  attempts = signal<QuizAttempt[]>([]);
  stats = signal<ProfileStats | null>(null);
  isEditing = signal(false);
  isUpdating = signal(false);
  isLoading = signal(true);
  updateError = signal('');
  updateSuccess = signal('');

  editForm: UpdateProfileRequest = {
    name: '',
    email: '',
    password: '',
    currentPassword: '',
  };

  ngOnInit() {
    this.loadProfile();
    this.loadAttempts();
    this.loadStats();
  }

  loadProfile() {
    // Get from auth service first (cached)
    const cachedUser = this.auth.currentUser();
    if (cachedUser) {
      this.user.set(cachedUser);
      this.editForm.name = cachedUser.name;
      this.editForm.email = cachedUser.email;
    }

    // Refresh from backend
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.editForm.name = user.name;
        this.editForm.email = user.email;
        // Update auth service cache
        this.auth.refreshProfile().subscribe();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  loadAttempts() {
    this.isLoading.set(true);
    this.quizzesService.getMyAttempts().subscribe({
      next: (data) => {
        // Take only the first 10 for display
        this.attempts.set(data.slice(0, 10));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading attempts:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadStats() {
    this.userService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: (err) => {
        // Stats endpoint might not exist, that's okay
        console.warn('Stats endpoint not available:', err);
      }
    });
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing());
    this.updateError.set('');
    this.updateSuccess.set('');
    
    if (this.isEditing()) {
      const currentUser = this.user();
      if (currentUser) {
        this.editForm.name = currentUser.name;
        this.editForm.email = currentUser.email;
      }
      this.editForm.password = '';
      this.editForm.currentPassword = '';
    }
  }

  updateProfile() {
    this.updateError.set('');
    this.updateSuccess.set('');
    
    // Validate password change
    if (this.editForm.password && !this.editForm.currentPassword) {
      this.updateError.set('Current password is required when changing password');
      return;
    }

    // Build update payload (only include fields that are being changed)
    const payload: UpdateProfileRequest = {};
    if (this.editForm.name && this.editForm.name !== this.user()?.name) {
      payload.name = this.editForm.name;
    }
    if (this.editForm.email && this.editForm.email !== this.user()?.email) {
      payload.email = this.editForm.email;
    }
    if (this.editForm.password) {
      payload.password = this.editForm.password;
      payload.currentPassword = this.editForm.currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      this.updateError.set('No changes to save');
      return;
    }

    this.isUpdating.set(true);
    this.userService.updateProfile(payload).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.updateSuccess.set('Profile updated successfully!');
        this.isUpdating.set(false);
        
        // Update auth service
        this.auth.refreshProfile().subscribe();
        
        // Close edit mode after 2 seconds
        setTimeout(() => {
          this.isEditing.set(false);
          this.updateSuccess.set('');
        }, 2000);
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Failed to update profile';
        this.updateError.set(errorMessage);
        this.isUpdating.set(false);
      }
    });
  }

  getScorePercentage(attempt: QuizAttempt): number {
    if (attempt.totalQuestions === 0) return 0;
    return Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }
}
