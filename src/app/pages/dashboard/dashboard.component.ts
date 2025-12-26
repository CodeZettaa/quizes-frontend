import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubjectsService } from '../../services/subjects.service';
import { Subject } from '../../types';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="card welcome-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2>Welcome back, {{ userName() }}! 👋</h2>
            <p class="welcome-subtitle">Ready to test your knowledge?</p>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              {{ totalPoints() }}
            </div>
            <div class="points-label">Total Points</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 1rem;">📚 Pick a Subject</h3>
        @if (subjects().length === 0) {
          <div style="text-align: center; padding: 2rem;">
            <div class="loading" style="margin: 0 auto;"></div>
            <p class="loading-text">Loading subjects...</p>
          </div>
        } @else {
          <div class="grid three">
            @for (subject of subjects(); track subject.id) {
              @if (subject.id) {
                <div class="card quiz-card">
                  <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 0.75rem;">
                    <h4 style="margin: 0;">{{ subject.name }}</h4>
                    <span style="font-size: 1.5rem;">📖</span>
                  </div>
                  <p class="subject-description">
                    {{ subject.description || 'Test your knowledge in this subject' }}
                  </p>
                  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a
                      class="btn secondary"
                      [routerLink]="['/subject', subject.id, 'level', 'beginner']"
                      >🌱 Beginner</a
                    >
                    <a
                      class="btn secondary"
                      [routerLink]="['/subject', subject.id, 'level', 'middle']"
                      >⭐ Middle</a
                    >
                    <a
                      class="btn secondary"
                      [routerLink]="['/subject', subject.id, 'level', 'intermediate']"
                      >🔥 Intermediate</a
                    >
                  </div>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .welcome-subtitle {
      color: var(--text-secondary, #6b7280);
      margin-top: 0.5rem;
    }

    .points-label {
      color: var(--text-secondary, #6b7280);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .loading-text {
      margin-top: 1rem;
      color: var(--text-secondary, #6b7280);
    }

    .subject-description {
      font-size: 0.9rem;
      color: var(--text-secondary, #6b7280);
      margin-bottom: 1rem;
      min-height: 2.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  private auth = inject(AuthService);
  subjects = signal<Subject[]>([]);
  
  // Use computed signals that reactively read from auth.currentUser
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user?.name || 'Student';
  });
  
  totalPoints = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      console.warn('[Dashboard] No user found in AuthService');
      return 0;
    }
    const points = user.totalPoints;
    console.log('[Dashboard] Computing totalPoints:', {
      points,
      type: typeof points,
      user: { id: user.id, name: user.name, totalPoints: user.totalPoints }
    });
    // Ensure we return a number, defaulting to 0 if undefined/null
    return typeof points === 'number' ? points : 0;
  });

  ngOnInit() {
    // Refresh user profile to get latest data including totalPoints
    this.auth.refreshProfile().subscribe({
      next: (user) => {
        console.log('User profile refreshed on dashboard load:', user);
        console.log('Total points:', user.totalPoints);
      },
      error: (err) => {
        console.error('Error refreshing profile:', err);
        // Still show cached user data if refresh fails
        const cachedUser = this.auth.currentUser();
        console.log('Using cached user data:', cachedUser);
      }
    });

    this.subjectsService.list().subscribe({
      next: (data) => {
        // Log to debug if subjects don't have id
        if (data && data.length > 0 && !data[0].id) {
          console.warn('Subjects missing id field:', data);
        }
        this.subjects.set(data);
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
      }
    });
  }
}
