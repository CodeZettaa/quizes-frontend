import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesStore } from '../../services/preferences.store';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <label class="language-label">Language</label>
      <div class="language-options">
        <button
          class="language-option"
          [class.active]="languageSignal() === 'en'"
          (click)="setLanguage('en')"
        >
          🇺🇸 English
        </button>
        <button
          class="language-option"
          [class.active]="languageSignal() === 'ar'"
          (click)="setLanguage('ar')"
        >
          🇸🇦 العربية
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .language-label {
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      font-size: 0.9rem;
    }

    .language-options {
      display: flex;
      gap: 0.5rem;
    }

    .language-option {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      background: var(--bg-secondary, white);
      color: var(--text-primary, #1f2937);
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .language-option:hover {
      border-color: var(--primary-color, #6366f1);
      transform: translateY(-2px);
    }

    .language-option.active {
      background: var(--primary-color, #6366f1);
      color: white;
      border-color: var(--primary-color, #6366f1);
    }

    [data-theme="dark"] .language-option {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    [data-theme="dark"] .language-option.active {
      background: #6366f1;
      color: white;
    }
  `]
})
export class LanguageSwitcherComponent {
  private preferencesStore = inject(PreferencesStore);
  languageSignal = this.preferencesStore.languageSignal;

  async setLanguage(language: 'en' | 'ar') {
    await this.preferencesStore.updateLanguage(language);
  }
}

