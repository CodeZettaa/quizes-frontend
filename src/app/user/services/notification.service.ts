import { Injectable, signal, effect } from '@angular/core';
import { PreferencesStore } from './preferences.store';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permission = signal<NotificationPermission>('default');
  private isSupported = signal(false);

  constructor(private preferencesStore: PreferencesStore) {
    // Check if notifications are supported
    if ('Notification' in window) {
      this.isSupported.set(true);
      this.permission.set(Notification.permission);
    }

    // Listen to push notification preference changes
    effect(() => {
      const enabled = this.preferencesStore.pushNotificationsSignal();
      if (enabled && this.permission() === 'default') {
        // Auto-request permission when user enables notifications
        this.requestPermission();
      }
    });
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    if (this.permission() === 'granted') {
      return 'granted';
    }

    if (this.permission() === 'denied') {
      console.warn('Notification permission was previously denied');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission.set(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.permission.set('denied');
      return 'denied';
    }
  }

  /**
   * Check if notifications are enabled and allowed
   */
  canNotify(): boolean {
    return (
      this.isSupported() &&
      this.permission() === 'granted' &&
      this.preferencesStore.pushNotificationsSignal()
    );
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<void> {
    if (!this.canNotify()) {
      console.log('Notifications not available or disabled:', {
        supported: this.isSupported(),
        permission: this.permission(),
        enabled: this.preferencesStore.pushNotificationsSignal(),
      });
      return;
    }

    try {
      const notificationOptions: NotificationOptions = {
        icon: options.icon || '/assets/icon-192x192.png',
        badge: options.badge || '/assets/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options,
      };

      const notification = new Notification(options.title, notificationOptions);

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show quiz completion notification
   */
  async showQuizComplete(score: number, totalQuestions: number, pointsEarned: number): Promise<void> {
    const percentage = Math.round((score / totalQuestions) * 100);
    let emoji = '📚';
    let message = `You scored ${score}/${totalQuestions} (${percentage}%)`;

    if (percentage >= 80) {
      emoji = '🎉';
      message = `Excellent! You scored ${score}/${totalQuestions} (${percentage}%)`;
    } else if (percentage >= 60) {
      emoji = '👍';
      message = `Good job! You scored ${score}/${totalQuestions} (${percentage}%)`;
    }

    await this.show({
      title: `${emoji} Quiz Complete!`,
      body: `${message}. You earned ${pointsEarned} points!`,
      tag: 'quiz-complete',
      requireInteraction: false,
    });
  }

  /**
   * Show achievement notification
   */
  async showAchievement(title: string, description: string): Promise<void> {
    await this.show({
      title: `🏆 Achievement Unlocked: ${title}`,
      body: description,
      tag: 'achievement',
      requireInteraction: true,
    });
  }

  /**
   * Show streak notification
   */
  async showStreak(days: number): Promise<void> {
    await this.show({
      title: `🔥 ${days} Day Streak!`,
      body: `Keep it up! You've been active for ${days} days in a row.`,
      tag: 'streak',
      requireInteraction: false,
    });
  }

  /**
   * Show points milestone notification
   */
  async showPointsMilestone(points: number): Promise<void> {
    await this.show({
      title: `🎯 ${points} Points Milestone!`,
      body: `Congratulations! You've reached ${points} total points.`,
      tag: 'milestone',
      requireInteraction: false,
    });
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission();
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported(): boolean {
    return this.isSupported();
  }
}

