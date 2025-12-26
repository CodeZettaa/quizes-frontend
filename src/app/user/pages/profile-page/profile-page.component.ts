import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserStats } from '../../../types';
import { UserSummaryCardComponent } from '../../components/user-summary-card/user-summary-card.component';
import { UserStatsCardComponent } from '../../components/user-stats-card/user-stats-card.component';
import { AvatarUploadComponent } from '../../components/avatar-upload/avatar-upload.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSummaryCardComponent,
    UserStatsCardComponent,
    AvatarUploadComponent,
  ],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="skeleton-loader">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      } @else if (error()) {
        <div class="error-card">
          <h3>⚠️ Error Loading Profile</h3>
          <p>{{ error() }}</p>
          <button class="btn" (click)="loadProfile()">🔄 Retry</button>
        </div>
      } @else {
        @if (user()) {
          <app-user-summary-card [user]="user()!" [stats]="stats()" />
        }

        @if (stats()) {
          <app-user-stats-card [stats]="stats()!" />
        }

        <!-- Edit Profile Modal -->
        @if (showEditModal()) {
          <div class="modal-overlay" (click)="closeEditModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Edit Profile</h3>
                <button class="close-btn" (click)="closeEditModal()">✕</button>
              </div>
              
              <form (ngSubmit)="saveProfile()" class="edit-form">
                <div class="form-group">
                  <label>Avatar</label>
                  <app-avatar-upload
                    [avatarUrl]="editForm.avatarUrl"
                    (avatarUrlChange)="editForm.avatarUrl = $event"
                  />
                </div>

                <div class="form-group">
                  <label>Name</label>
                  <input
                    class="input"
                    [(ngModel)]="editForm.name"
                    name="name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Bio</label>
                  <textarea
                    class="input"
                    [(ngModel)]="editForm.bio"
                    name="bio"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Primary Subject</label>
                  <select class="input" [(ngModel)]="editForm.primarySubject" name="primarySubject">
                    <option [value]="undefined">None</option>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JS">JavaScript</option>
                    <option value="Angular">Angular</option>
                    <option value="React">React</option>
                    <option value="NextJS">NextJS</option>
                    <option value="NestJS">NestJS</option>
                    <option value="NodeJS">NodeJS</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Preferred Level</label>
                  <select class="input" [(ngModel)]="editForm.preferredLevel" name="preferredLevel">
                    <option [value]="undefined">Mixed</option>
                    <option value="beginner">Beginner</option>
                    <option value="middle">Middle</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn secondary" (click)="closeEditModal()">
                    Cancel
                  </button>
                  <button type="submit" class="btn" [disabled]="saving()">
                    @if (saving()) {
                      <span class="loading" style="display: inline-block; margin-right: 0.5rem;"></span>
                      Saving...
                    } @else {
                      💾 Save Changes
                    }
                  </button>
                </div>

                @if (saveError()) {
                  <p class="error-message">{{ saveError() }}</p>
                }
              </form>
            </div>
          </div>
        }

        <div class="actions">
          <button class="btn" (click)="openEditModal()">✏️ Edit Profile</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .skeleton-loader {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .skeleton-card {
      height: 300px;
      background: var(--bg-secondary, #f3f4f6);
      border-radius: 16px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .error-card {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.1));
    }

    .error-card h3 {
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      justify-content: center;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: var(--bg-card, white);
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary, #6b7280);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    .edit-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .error-message {
      color: #ef4444;
      margin: 0;
      font-size: 0.9rem;
    }

    [data-theme="dark"] .modal-content {
      background: #1f2937;
    }

    [data-theme="dark"] .skeleton-card {
      background: #111827;
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  user = signal<User | null>(null);
  stats = signal<UserStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showEditModal = signal(false);
  saving = signal(false);
  saveError = signal<string | null>(null);
  private previousStats = signal<UserStats | null>(null);
  private previousTotalPoints = signal<number>(0);

  editForm = {
    name: '',
    bio: '',
    avatarUrl: undefined as string | undefined,
    primarySubject: undefined as string | undefined,
    preferredLevel: undefined as 'beginner' | 'middle' | 'intermediate' | 'mixed' | undefined,
  };

  ngOnInit() {
    this.loadProfile();
    this.loadStats();
  }

  loadProfile() {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getMe().subscribe({
      next: (user) => {
        const previousPoints = this.previousTotalPoints();
        this.user.set(user);
        this.previousTotalPoints.set(user.totalPoints);
        this.loading.set(false);
        
        // Check for points milestones
        if (previousPoints > 0) {
          this.checkForPointsMilestones(previousPoints, user.totalPoints);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.userService.getMyStats().subscribe({
      next: (stats) => {
        const previous = this.previousStats();
        this.stats.set(stats);
        this.previousStats.set(stats);
        
        // Check for milestones and show notifications
        if (previous) {
          this.checkForMilestones(previous, stats);
        }
      },
      error: (err) => {
        console.warn('Stats not available:', err);
      }
    });
  }

  /**
   * Check for milestones and show notifications
   */
  private async checkForMilestones(previous: UserStats, current: UserStats) {
    // Check for streak milestones (every 7 days)
    if (current.streakDays > previous.streakDays && current.streakDays % 7 === 0) {
      await this.notificationService.showStreak(current.streakDays);
    }
  }

  /**
   * Check for points milestones
   */
  private async checkForPointsMilestones(previousPoints: number, currentPoints: number) {
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    
    for (const milestone of milestones) {
      // Check if we just crossed this milestone
      if (previousPoints < milestone && currentPoints >= milestone) {
        await this.notificationService.showPointsMilestone(milestone);
        break; // Only show one notification at a time
      }
    }
  }

  openEditModal() {
    const currentUser = this.user();
    if (currentUser) {
      this.editForm = {
        name: currentUser.name,
        bio: currentUser.bio || '',
        avatarUrl: currentUser.avatarUrl,
        primarySubject: currentUser.preferences.primarySubject,
        preferredLevel: currentUser.preferences.preferredLevel,
      };
    }
    this.showEditModal.set(true);
    this.saveError.set(null);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.saveError.set(null);
  }

  saveProfile() {
    this.saving.set(true);
    this.saveError.set(null);

    const payload: Partial<User> = {
      name: this.editForm.name,
      bio: this.editForm.bio || undefined,
      avatarUrl: this.editForm.avatarUrl,
      preferences: {
        primarySubject: this.editForm.primarySubject,
        preferredLevel: this.editForm.preferredLevel,
      } as any,
    };

    this.userService.updateMe(payload).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.saving.set(false);
        this.closeEditModal();
      },
      error: (err) => {
        this.saveError.set(err.error?.message || 'Failed to update profile');
        this.saving.set(false);
      }
    });
  }
}

