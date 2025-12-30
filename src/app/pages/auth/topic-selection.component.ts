import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/services/auth.service";

type SubjectName = 'HTML' | 'CSS' | 'JavaScript' | 'Angular' | 'React' | 'NextJS' | 'NestJS' | 'NodeJS';

interface Topic {
  id: SubjectName;
  name: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: "app-topic-selection",
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card topic-selection-card">
        <h2 class="title">Choose Your Topics</h2>
        <p class="subtitle">Select the topics you want to practice. You can change this later in settings.</p>

        <div class="topics-grid">
          @for (topic of topics; track topic.id) {
            <button
              class="topic-card"
              [class.selected]="selectedTopics().includes(topic.id)"
              (click)="toggleTopic(topic.id)"
            >
              <span class="topic-icon">{{ topic.icon }}</span>
              <span class="topic-name">{{ topic.name }}</span>
            </button>
          }
        </div>

        <div class="actions">
          <button
            class="btn btn-select-all"
            (click)="selectAll()"
          >
            Select All
          </button>
          <button
            class="btn btn-primary"
            [disabled]="selectedTopics().length === 0 || saving()"
            (click)="saveTopics()"
          >
            @if (saving()) {
              Saving...
            } @else {
              Continue
            }
          </button>
        </div>

        @if (error()) {
          <p class="error-message">{{ error() }}</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .topic-selection-card {
        max-width: 800px;
        width: 100%;
        padding: 2.5rem;
      }

      .title {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-align: center;
        color: var(--text-primary, #1f2937);
      }

      .subtitle {
        text-align: center;
        color: var(--text-secondary, #6b7280);
        margin-bottom: 2rem;
        font-size: 1rem;
      }

      .topics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .topic-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        border: 2px solid var(--border-color, #e5e7eb);
        border-radius: 12px;
        background: var(--bg-card, white);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary, #1f2937);
      }

      .topic-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color, #6366f1);
      }

      .topic-card.selected {
        background: var(--primary-color, #6366f1);
        color: white;
        border-color: var(--primary-color, #6366f1);
      }

      .topic-icon {
        font-size: 2rem;
      }

      .topic-name {
        text-align: center;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.875rem 2rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary {
        background: var(--primary-color, #6366f1);
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--primary-dark, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .btn-select-all {
        background: var(--bg-secondary, #f3f4f6);
        color: var(--text-primary, #1f2937);
        border: 2px solid var(--border-color, #e5e7eb);
      }

      .btn-select-all:hover {
        background: var(--border-color, #e5e7eb);
      }

      .error-message {
        color: #ef4444;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fee2e2;
        border-radius: 8px;
        text-align: center;
        font-size: 0.9rem;
      }

      [data-theme="dark"] .topic-card {
        background: var(--bg-card, #1f2937);
        border-color: var(--border-color, #374151);
        color: var(--text-primary, #f3f4f6);
      }

      [data-theme="dark"] .btn-select-all {
        background: var(--bg-secondary, #111827);
        border-color: var(--border-color, #374151);
        color: var(--text-primary, #f3f4f6);
      }

      [data-theme="dark"] .btn-select-all:hover {
        background: var(--border-color, #374151);
      }
    `,
  ],
})
export class TopicSelectionComponent {
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);

  topics: Topic[] = [
    { id: 'HTML', name: 'HTML', icon: '🌐' },
    { id: 'CSS', name: 'CSS', icon: '🎨' },
    { id: 'JavaScript', name: 'JavaScript', icon: '⚡' },
    { id: 'Angular', name: 'Angular', icon: '🅰️' },
    { id: 'React', name: 'React', icon: '⚛️' },
    { id: 'NextJS', name: 'Next.js', icon: '▲' },
    { id: 'NestJS', name: 'NestJS', icon: '🪺' },
    { id: 'NodeJS', name: 'Node.js', icon: '🟢' },
  ];

  selectedTopics = signal<SubjectName[]>([]);
  saving = signal(false);
  error = signal<string>("");

  toggleTopic(topicId: SubjectName) {
    const current = this.selectedTopics();
    if (current.includes(topicId)) {
      this.selectedTopics.set(current.filter(id => id !== topicId));
    } else {
      this.selectedTopics.set([...current, topicId]);
    }
  }

  selectAll() {
    const allTopics: SubjectName[] = this.topics.map(t => t.id);
    this.selectedTopics.set(allTopics);
  }

  saveTopics() {
    if (this.selectedTopics().length === 0) {
      this.error.set("Please select at least one topic");
      return;
    }

    this.saving.set(true);
    this.error.set("");

    this.httpClient
      .patch(`${environment.apiBaseUrl}/api/users/me/selected-subjects`, {
        selectedSubjects: this.selectedTopics(),
      })
      .subscribe({
        next: (user: any) => {
          // Update user in auth service
          this.authService.setUser(user);
          this.saving.set(false);
          // Redirect to dashboard
          this.router.navigate(["/dashboard"]);
        },
        error: (err) => {
          console.error("Error saving topics:", err);
          this.error.set(err.error?.message || "Failed to save topics. Please try again.");
          this.saving.set(false);
        },
      });
  }
}

