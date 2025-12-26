import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { PreferencesStore } from '../../services/preferences.store';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

type SettingsSection = 'appearance' | 'language' | 'notifications' | 'security';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemeToggleComponent,
    LanguageSwitcherComponent,
  ],
  template: `
    <div class="settings-container">
      <div class="settings-sidebar">
        <h2 class="sidebar-title">Settings</h2>
        <nav class="settings-nav">
          <button
            class="nav-item"
            [class.active]="activeSection() === 'appearance'"
            (click)="setSection('appearance')"
          >
            🎨 Appearance
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'language'"
            (click)="setSection('language')"
          >
            🌐 Language
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'notifications'"
            (click)="setSection('notifications')"
          >
            🔔 Notifications
          </button>
          <button
            class="nav-item"
            [class.active]="activeSection() === 'security'"
            (click)="setSection('security')"
          >
            🔒 Security
          </button>
        </nav>
      </div>

      <div class="settings-content">
        <!-- Appearance Section -->
        @if (activeSection() === 'appearance') {
          <div class="settings-section">
            <h2 class="section-title">Appearance</h2>
            <div class="section-card">
              <app-theme-toggle />
            </div>
          </div>
        }

        <!-- Language Section -->
        @if (activeSection() === 'language') {
          <div class="settings-section">
            <h2 class="section-title">Language</h2>
            <div class="section-card">
              <app-language-switcher />
            </div>
          </div>
        }

        <!-- Notifications Section -->
        @if (activeSection() === 'notifications') {
          <div class="settings-section">
            <h2 class="section-title">Notifications</h2>
            <div class="section-card">
              <div class="toggle-group">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <label class="toggle-label">Email Notifications</label>
                    <p class="toggle-description">Receive email updates about your quiz results and achievements</p>
                  </div>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      [checked]="emailNotifications()"
                      (change)="updateEmailNotifications($event)"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <label class="toggle-label">Push Notifications</label>
                    <p class="toggle-description">Receive browser push notifications for quiz results and achievements</p>
                    @if (notificationPermission() === 'denied') {
                      <p class="permission-warning">⚠️ Notifications are blocked. Please enable them in your browser settings.</p>
                    } @else if (notificationPermission() === 'default') {
                      <p class="permission-hint">Click the toggle to request notification permission</p>
                    } @else if (notificationPermission() === 'granted') {
                      <p class="permission-success">✅ Notifications are enabled</p>
                    }
                  </div>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      [checked]="pushNotifications()"
                      [disabled]="!isNotificationSupported()"
                      (change)="updatePushNotifications($event)"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                @if (!isNotificationSupported()) {
                  <div class="notification-warning">
                    <p>⚠️ Browser notifications are not supported in this browser.</p>
                  </div>
                }
              </div>

              @if (pushNotifications() && notificationPermission() === 'granted') {
                <div class="test-notification">
                  <button class="btn secondary" (click)="testNotification()">
                    🔔 Test Notification
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Security Section -->
        @if (activeSection() === 'security') {
          <div class="settings-section">
            <h2 class="section-title">Change Password</h2>
            <div class="section-card">
              <form (ngSubmit)="changePassword()" class="password-form">
                <div class="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    class="input"
                    [(ngModel)]="passwordForm.currentPassword"
                    name="currentPassword"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    class="input"
                    [(ngModel)]="passwordForm.newPassword"
                    name="newPassword"
                    required
                    minlength="6"
                  />
                  <p class="form-hint">Minimum 6 characters</p>
                </div>

                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    class="input"
                    [(ngModel)]="passwordForm.confirmPassword"
                    name="confirmPassword"
                    required
                  />
                </div>

                @if (passwordError()) {
                  <p class="error-message">{{ passwordError() }}</p>
                }

                @if (passwordSuccess()) {
                  <p class="success-message">{{ passwordSuccess() }}</p>
                }

                <div class="form-actions">
                  <button type="submit" class="btn" [disabled]="changingPassword()">
                    @if (changingPassword()) {
                      <span class="loading" style="display: inline-block; margin-right: 0.5rem;"></span>
                      Changing...
                    } @else {
                      🔒 Change Password
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
    }

    .settings-sidebar {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.1));
    }

    .sidebar-title {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      border-radius: 8px;
      color: var(--text-secondary, #6b7280);
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
    }

    .nav-item.active {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .settings-content {
      min-height: 400px;
    }

    .settings-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .section-card {
      background: var(--bg-card, white);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.1));
    }

    .toggle-group {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .toggle-info {
      flex: 1;
    }

    .toggle-label {
      display: block;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
      margin-bottom: 0.25rem;
    }

    .toggle-description {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-secondary, #6b7280);
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 26px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--primary-color, #6366f1);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .password-form {
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

    .form-hint {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-secondary, #6b7280);
    }

    .form-actions {
      margin-top: 1rem;
    }

    .error-message {
      color: #ef4444;
      margin: 0;
      font-size: 0.9rem;
    }

    .success-message {
      color: #10b981;
      margin: 0;
      font-size: 0.9rem;
    }

    .permission-warning {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .permission-hint {
      color: var(--text-secondary, #6b7280);
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .permission-success {
      color: #10b981;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .notification-warning {
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      margin-top: 1rem;
    }

    .notification-warning p {
      margin: 0;
      color: #ef4444;
      font-size: 0.9rem;
    }

    .test-notification {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    @media (max-width: 768px) {
      .settings-container {
        grid-template-columns: 1fr;
      }

      .settings-sidebar {
        position: sticky;
        top: 1rem;
      }

      .settings-nav {
        flex-direction: row;
        overflow-x: auto;
      }

      .nav-item {
        white-space: nowrap;
      }
    }

    [data-theme="dark"] .settings-sidebar,
    [data-theme="dark"] .section-card {
      background: #1f2937;
    }
  `]
})
export class SettingsPageComponent implements OnInit {
  private userService = inject(UserService);
  private preferencesStore = inject(PreferencesStore);
  private notificationService = inject(NotificationService);

  activeSection = signal<SettingsSection>('appearance');
  emailNotifications = this.preferencesStore.emailNotificationsSignal;
  pushNotifications = this.preferencesStore.pushNotificationsSignal;
  notificationPermission = signal<NotificationPermission>('default');
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  
  changingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  ngOnInit() {
    // Load user preferences
    this.userService.getMe().subscribe({
      next: (user) => {
        this.preferencesStore.initialize(user.preferences);
      },
      error: (err) => {
        console.error('Failed to load user preferences:', err);
      }
    });

    // Check notification permission
    this.updateNotificationPermission();
  }

  updateNotificationPermission() {
    this.notificationPermission.set(this.notificationService.getPermission());
  }

  isNotificationSupported(): boolean {
    return this.notificationService.isNotificationSupported();
  }

  async testNotification() {
    await this.notificationService.show({
      title: '🔔 Test Notification',
      body: 'Notifications are working correctly!',
      tag: 'test',
    });
  }

  setSection(section: SettingsSection) {
    this.activeSection.set(section);
  }

  async updateEmailNotifications(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    try {
      await this.preferencesStore.updateNotifications(checked, this.pushNotifications());
    } catch (error) {
      // Revert on error
      (event.target as HTMLInputElement).checked = !checked;
    }
  }

  async updatePushNotifications(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      // Request permission when enabling
      const permission = await this.notificationService.requestPermission();
      this.updateNotificationPermission();
      
      if (permission !== 'granted') {
        // Revert if permission denied
        (event.target as HTMLInputElement).checked = false;
        alert('Notification permission is required to enable push notifications. Please allow notifications in your browser settings.');
        return;
      }
    }
    
    try {
      await this.preferencesStore.updateNotifications(this.emailNotifications(), checked);
    } catch (error) {
      // Revert on error
      (event.target as HTMLInputElement).checked = !checked;
    }
  }

  changePassword() {
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }

    this.changingPassword.set(true);

    this.userService.updatePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    }).subscribe({
      next: () => {
        this.passwordSuccess.set('Password changed successfully!');
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
        this.changingPassword.set(false);
      },
      error: (err) => {
        this.passwordError.set(err.error?.message || 'Failed to change password');
        this.changingPassword.set(false);
      }
    });
  }
}

