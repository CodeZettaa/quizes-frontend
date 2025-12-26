import { Injectable, signal, effect, inject } from '@angular/core';
import { UserPreferences } from '../../types';
import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private userService = inject(UserService);
  
  themeSignal = signal<'light' | 'dark' | 'system'>('system');
  languageSignal = signal<'en' | 'ar'>('en');
  emailNotificationsSignal = signal<boolean>(true);
  pushNotificationsSignal = signal<boolean>(true);
  primarySubjectSignal = signal<string | undefined>(undefined);
  preferredLevelSignal = signal<'beginner' | 'middle' | 'intermediate' | 'mixed' | undefined>(undefined);

  private systemThemeMediaQuery?: MediaQueryList;
  private systemThemeListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    // Apply theme changes immediately
    effect(() => {
      this.applyTheme(this.themeSignal());
    });

    // Apply language changes immediately
    effect(() => {
      this.applyLanguage(this.languageSignal());
    });

    // Listen to system theme changes
    this.setupSystemThemeListener();

    // Apply initial theme (before user data loads)
    this.applyTheme(this.themeSignal());
    this.applyLanguage(this.languageSignal());
  }

  /**
   * Initialize preferences from user data
   */
  initialize(preferences: UserPreferences) {
    this.themeSignal.set(preferences.theme);
    this.languageSignal.set(preferences.language);
    this.emailNotificationsSignal.set(preferences.emailNotifications);
    this.pushNotificationsSignal.set(preferences.pushNotifications);
    this.primarySubjectSignal.set(preferences.primarySubject);
    this.preferredLevelSignal.set(preferences.preferredLevel);
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme: 'light' | 'dark' | 'system') {
    this.themeSignal.set(theme);
    await this.savePreferences();
  }

  /**
   * Update language preference
   */
  async updateLanguage(language: 'en' | 'ar') {
    this.languageSignal.set(language);
    await this.savePreferences();
  }

  /**
   * Update notification preferences
   */
  async updateNotifications(email: boolean, push: boolean) {
    this.emailNotificationsSignal.set(email);
    this.pushNotificationsSignal.set(push);
    await this.savePreferences();
  }

  /**
   * Update primary subject
   */
  async updatePrimarySubject(subject: string | undefined) {
    this.primarySubjectSignal.set(subject);
    await this.savePreferences();
  }

  /**
   * Update preferred level
   */
  async updatePreferredLevel(level: 'beginner' | 'middle' | 'intermediate' | 'mixed' | undefined) {
    this.preferredLevelSignal.set(level);
    await this.savePreferences();
  }

  /**
   * Save preferences to backend
   */
  private async savePreferences() {
    const preferences: Partial<UserPreferences> = {
      theme: this.themeSignal(),
      language: this.languageSignal(),
      emailNotifications: this.emailNotificationsSignal(),
      pushNotifications: this.pushNotificationsSignal(),
      primarySubject: this.primarySubjectSignal(),
      preferredLevel: this.preferredLevelSignal(),
    };

    try {
      await this.userService.updateMe({ preferences }).toPromise();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Don't throw - allow UI to continue working
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark' | 'system') {
    const body = document.body;
    const html = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const effectiveTheme = prefersDark ? 'dark' : 'light';
      body.setAttribute('data-theme', effectiveTheme);
      html.setAttribute('data-theme', effectiveTheme);
    } else {
      body.setAttribute('data-theme', theme);
      html.setAttribute('data-theme', theme);
    }
  }

  /**
   * Apply language to document
   */
  private applyLanguage(language: 'en' | 'ar') {
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    body.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');

    // Add/remove RTL class for styling
    if (language === 'ar') {
      body.classList.add('rtl');
      html.classList.add('rtl');
    } else {
      body.classList.remove('rtl');
      html.classList.remove('rtl');
    }
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.systemThemeListener = (e: MediaQueryListEvent) => {
        if (this.themeSignal() === 'system') {
          this.applyTheme('system');
        }
      };

      // Use addEventListener if available, otherwise use addListener for older browsers
      if (this.systemThemeMediaQuery.addEventListener) {
        this.systemThemeMediaQuery.addEventListener('change', this.systemThemeListener);
      } else {
        // Fallback for older browsers
        this.systemThemeMediaQuery.addListener(this.systemThemeListener);
      }
    }
  }

  /**
   * Get current effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.themeSignal();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }
}

