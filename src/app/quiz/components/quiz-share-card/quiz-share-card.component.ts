import { CommonModule } from '@angular/common';
import { Component, input, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ShareService } from '../../services/share.service';
import { QuizSharePayload } from '../../models/share.models';

@Component({
  standalone: true,
  selector: 'app-quiz-share-card',
  imports: [CommonModule],
  templateUrl: './quiz-share-card.component.html',
  styleUrl: './quiz-share-card.component.css'
})
export class QuizShareCardComponent {
  private shareService = inject(ShareService);

  attemptId = input.required<string>();
  summary = input.required<QuizSharePayload>();
  showAutoPostOption = input<boolean>(false);

  isLoadingLink = signal(false);
  shareLink = signal<string | null>(null);
  error = signal<string | null>(null);
  isPosting = signal(false);
  postedUrl = signal<string | null>(null);
  linkCopied = signal(false);

  getShareMessage(): string {
    const s = this.summary();
    const percentage = Math.round((s.correctAnswersCount / s.totalQuestions) * 100);
    const subject = s.subject || 'Quiz';
    const level = s.level ? ` (${s.level.charAt(0).toUpperCase() + s.level.slice(1)})` : '';
    return `I scored ${s.correctAnswersCount}/${s.totalQuestions} (${percentage}%) in ${subject}${level} on CodeZetta Quiz.\n+${s.pointsEarned} points earned.\n#CodeZetta #Quiz #Learning`;
  }

  getShareTitle(): string {
    const s = this.summary();
    const subject = s.subject || 'Quiz';
    const level = s.level ? ` ${s.level.charAt(0).toUpperCase() + s.level.slice(1)}` : '';
    return `${subject}${level} Quiz Result`;
  }

  async handleShareToLinkedIn(): Promise<void> {
    const existingLink = this.shareLink();
    const shareMessage = this.getShareMessage();
    const shareTitle = this.getShareTitle();
    
    if (existingLink) {
      this.shareService.shareToLinkedIn(existingLink, {
        title: shareTitle,
        summary: shareMessage,
      });
      return;
    }

    this.isLoadingLink.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.shareService.createShareLink(this.attemptId()));
      if (response?.url) {
        this.shareLink.set(response.url);
        this.shareService.shareToLinkedIn(response.url, {
          title: shareTitle,
          summary: shareMessage,
        });
      } else {
        this.error.set("Couldn't generate a share link. Please try again.");
      }
    } catch (err) {
      console.error('Error creating share link:', err);
      this.error.set("Couldn't generate a share link. Please try again.");
    } finally {
      this.isLoadingLink.set(false);
    }
  }

  async handlePostToLinkedIn(): Promise<void> {
    this.isPosting.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.shareService.postToLinkedIn(this.attemptId()));
      if (response?.status === 'posted') {
        this.postedUrl.set(response.postUrl || null);
      } else {
        this.error.set("Couldn't post to LinkedIn. Please try again.");
      }
    } catch (err) {
      console.error('Error posting to LinkedIn:', err);
      this.error.set("Couldn't post to LinkedIn. Please try again.");
    } finally {
      this.isPosting.set(false);
    }
  }

  async copyLink(): Promise<void> {
    const link = this.shareLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      this.linkCopied.set(true);
      setTimeout(() => {
        this.linkCopied.set(false);
      }, 2000);
    } catch (err) {
      console.error('Error copying link:', err);
      this.error.set("Couldn't copy link. Please try again.");
    }
  }

  retry(): void {
    this.error.set(null);
    this.shareLink.set(null);
  }
}
