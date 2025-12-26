import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesStore } from '../../services/preferences.store';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-toggle">
      <label class="theme-label">Theme</label>
      <div class="theme-options">
        <button
          class="theme-option"
          [class.active]="themeSignal() === 'light'"
          (click)="setTheme('light')"
        >
          ☀️ Light
        </button>
        <button
          class="theme-option"
          [class.active]="themeSignal() === 'dark'"
          (click)="setTheme('dark')"
        >
          🌙 Dark
        </button>
        <button
          class="theme-option"
          [class.active]="themeSignal() === 'system'"
          (click)="setTheme('system')"
        >
          💻 System
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .theme-label {
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      font-size: 0.9rem;
    }

    .theme-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .theme-option {
      flex: 1;
      min-width: 100px;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      background: var(--bg-secondary, white);
      color: var(--text-primary, #1f2937);
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .theme-option:hover {
      border-color: var(--primary-color, #6366f1);
      transform: translateY(-2px);
    }

    .theme-option.active {
      background: var(--primary-color, #6366f1);
      color: white;
      border-color: var(--primary-color, #6366f1);
    }

    [data-theme="dark"] .theme-option {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    [data-theme="dark"] .theme-option.active {
      background: #6366f1;
      color: white;
    }
  `]
})
export class ThemeToggleComponent {
  private preferencesStore = inject(PreferencesStore);
  themeSignal = this.preferencesStore.themeSignal;

  async setTheme(theme: 'light' | 'dark' | 'system') {
    await this.preferencesStore.updateTheme(theme);
  }
}

