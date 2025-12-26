import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../types';

@Component({
  standalone: true,
  selector: 'app-leaderboard',
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Leaderboard</h2>
        <table style="width: 100%; margin-top: 1rem; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left;">Rank</th>
              <th style="text-align: left;">Name</th>
              <th style="text-align: left;">Points</th>
            </tr>
          </thead>
          <tbody>
            @for (user of leaderboard(); track user.id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.totalPoints }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class LeaderboardComponent implements OnInit {
  private userService = inject(UserService);
  leaderboard = signal<User[]>([]);

  ngOnInit() {
    this.userService.getLeaderboard().subscribe((data) => this.leaderboard.set(data));
  }
}
