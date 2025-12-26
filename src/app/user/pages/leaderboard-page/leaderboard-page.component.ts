import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { UserService } from "../../../services/user.service";
import { AuthService } from "../../../services/auth.service";
import { LeaderboardEntry } from "../../../types";

@Component({
  selector: "app-leaderboard-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <h1>Leaderboard</h1>
        <p class="subtitle">Top performers in the quiz platform</p>
      </div>

      @if (loading()) {
      <div class="skeleton-loader">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
      } @else if (error()) {
      <div class="error-card">
        <h3>⚠️ Error Loading Leaderboard</h3>
        <p>{{ error() }}</p>
        <button class="btn" (click)="loadLeaderboard()">🔄 Retry</button>
      </div>
      } @else {
      <!-- Top 3 Podium -->
      @if (topThree().length > 0) {
      <div class="podium-container">
        @if (topThree()[1]) {
        <div class="podium-block second">
          <div class="podium-number">2</div>
          <div class="podium-divider"></div>
          <div class="podium-name">{{ topThree()[1].name }}</div>
          <div class="podium-score">{{ topThree()[1].totalPoints }} pts</div>
        </div>
        } @if (topThree()[0]) {
        <div class="podium-block first">
          <div class="podium-number">1</div>
          <div class="podium-divider"></div>
          <div class="podium-name">{{ topThree()[0].name }}</div>
          <div class="podium-score">{{ topThree()[0].totalPoints }} pts</div>
        </div>
        } @if (topThree()[2]) {
        <div class="podium-block third">
          <div class="podium-number">3</div>
          <div class="podium-divider"></div>
          <div class="podium-name">{{ topThree()[2].name }}</div>
          <div class="podium-score">{{ topThree()[2].totalPoints }} pts</div>
        </div>
        }
      </div>
      }

      <!-- Rest of Leaderboard -->
      @if (restOfLeaderboard().length > 0) {
      <div class="leaderboard-table">
        <div class="table-header">
          <div class="table-cell rank">Rank</div>
          <div class="table-cell user">User</div>
          <div class="table-cell points">Points</div>
        </div>
        @for (entry of restOfLeaderboard(); track entry.userId) {
        <div
          class="table-row"
          [class.current-user]="isCurrentUser(entry.userId)"
        >
          <div class="table-cell rank">{{ entry.rank }}</div>
          <div class="table-cell user">
            <div class="user-info">
              @if (entry.avatarUrl) {
              <img
                [src]="entry.avatarUrl"
                [alt]="entry.name"
                class="user-avatar"
              />
              } @else {
              <div class="user-avatar placeholder">👤</div>
              }
              <span class="user-name">{{ entry.name }}</span>
              @if (isCurrentUser(entry.userId)) {
              <span class="you-badge">You</span>
              }
            </div>
          </div>
          <div class="table-cell points">{{ entry.totalPoints }}</div>
        </div>
        }
      </div>
      } @if (leaderboard().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No leaderboard data available yet.</p>
        <a routerLink="/dashboard" class="btn">Start Taking Quizzes</a>
      </div>
      } }
    </div>
  `,
  styles: [
    `
      .leaderboard-container {
        min-height: 100vh;
        background: #1a202c;
        padding: 3rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }

      .leaderboard-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .leaderboard-header h1 {
        margin: 0 0 0.5rem 0;
        font-size: 3rem;
        font-weight: 700;
        background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .subtitle {
        margin: 0;
        color: #9ca3af;
        font-size: 1.1rem;
        font-weight: 400;
      }

      .skeleton-loader {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .skeleton-card {
        height: 100px;
        background: rgba(55, 65, 81, 0.5);
        border-radius: 12px;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .error-card {
        background: rgba(31, 41, 55, 0.8);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        color: #f3f4f6;
      }

      .error-card h3 {
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .podium-container {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 1.5rem;
        margin: 3rem 0;
        padding: 0;
      }

      .podium-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 1.5rem 1rem;
        border-radius: 16px;
        min-width: 180px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }

      .podium-block:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
      }

      .podium-block.first {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        order: 2;
        min-height: 280px;
        height: 280px;
        box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
      }

      .podium-block.second {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        order: 1;
        min-height: 220px;
        height: 220px;
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
      }

      .podium-block.third {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        order: 3;
        min-height: 200px;
        height: 200px;
        box-shadow: 0 6px 16px rgba(217, 119, 6, 0.3);
      }

      .podium-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.25rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        line-height: 1;
        flex-shrink: 0;
      }

      .podium-divider {
        width: 60px;
        height: 2px;
        background: white;
        margin: 0.5rem 0;
        opacity: 0.9;
        flex-shrink: 0;
      }

      .podium-name {
        font-weight: 600;
        color: white;
        font-size: 1rem;
        text-align: center;
        margin-bottom: 0.5rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
        padding: 0 0.5rem;
        flex-shrink: 0;
      }

      .podium-score {
        font-weight: 700;
        color: white;
        font-size: 1.1rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        margin-top: auto;
        padding-top: 0.5rem;
        flex-shrink: 0;
      }

      .leaderboard-table {
        background: rgba(31, 41, 55, 0.6);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
      }

      .table-header {
        display: grid;
        grid-template-columns: 80px 1fr 120px;
        padding: 1.25rem 1.5rem;
        background: rgba(17, 24, 39, 0.8);
        font-weight: 600;
        color: #9ca3af;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .table-row {
        display: grid;
        grid-template-columns: 80px 1fr 120px;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(75, 85, 99, 0.5);
        transition: all 0.2s ease;
        color: #f3f4f6;
      }

      .table-row:hover {
        background: rgba(55, 65, 81, 0.5);
      }

      .table-row.current-user {
        background: rgba(167, 139, 250, 0.15);
        border-left: 3px solid #a78bfa;
      }

      .table-cell {
        display: flex;
        align-items: center;
      }

      .table-cell.rank {
        font-weight: 700;
        color: #f3f4f6;
        font-size: 1.1rem;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(167, 139, 250, 0.3);
      }

      .user-avatar.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(55, 65, 81, 0.8);
        font-size: 1.25rem;
        border: 2px solid rgba(167, 139, 250, 0.3);
      }

      .user-name {
        font-weight: 500;
        color: #f3f4f6;
      }

      .you-badge {
        background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
      }

      .table-cell.points {
        font-weight: 600;
        color: #f3f4f6;
        justify-content: flex-end;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: rgba(31, 41, 55, 0.6);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        color: #f3f4f6;
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .empty-state p {
        color: #9ca3af;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 768px) {
        .leaderboard-container {
          padding: 2rem 1rem;
        }

        .podium-container {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }

        .podium-block {
          width: 100%;
          max-width: 280px;
          height: auto !important;
          min-height: 180px;
        }

        .podium-block.first {
          order: 1;
        }

        .podium-block.second {
          order: 2;
        }

        .podium-block.third {
          order: 3;
        }

        .table-header,
        .table-row {
          grid-template-columns: 60px 1fr 80px;
          padding: 0.75rem 1rem;
        }

        .leaderboard-header h1 {
          font-size: 2rem;
        }
      }

      [data-theme="dark"] .leaderboard-container {
        background: #1a202c;
      }

      [data-theme="dark"] .podium-container,
      [data-theme="dark"] .leaderboard-table,
      [data-theme="dark"] .error-card,
      [data-theme="dark"] .empty-state {
        background: rgba(17, 24, 39, 0.8);
      }
    `,
  ],
})
export class LeaderboardPageComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  leaderboard = signal<LeaderboardEntry[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to load leaderboard");
        this.loading.set(false);
      },
    });
  }

  topThree() {
    return this.leaderboard().slice(0, 3);
  }

  restOfLeaderboard() {
    return this.leaderboard().slice(3);
  }

  isCurrentUser(userId: string): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === userId;
  }
}
