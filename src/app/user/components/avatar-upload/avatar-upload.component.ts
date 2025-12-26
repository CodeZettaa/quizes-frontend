import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="avatar-upload">
      <div class="avatar-preview">
        @if (avatarUrl()) {
          <img [src]="avatarUrl()" [alt]="'Avatar'" class="avatar-image" />
        } @else {
          <div class="avatar-placeholder">
            <span class="avatar-icon">👤</span>
          </div>
        }
      </div>
      
      <div class="avatar-controls">
        <label class="avatar-label">Avatar URL</label>
        <input
          type="text"
          class="input"
          [(ngModel)]="urlInput"
          placeholder="https://example.com/avatar.jpg"
          (blur)="onUrlChange()"
        />
        <p class="avatar-hint">Enter an image URL or leave blank for default avatar</p>
      </div>
    </div>
  `,
  styles: [`
    .avatar-upload {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    .avatar-preview {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--border-color, #e5e7eb);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary, #f3f4f6);
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .avatar-icon {
      font-size: 3rem;
    }

    .avatar-controls {
      width: 100%;
      max-width: 400px;
    }

    .avatar-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary, #1f2937);
      font-size: 0.9rem;
    }

    .avatar-hint {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary, #6b7280);
    }

    [data-theme="dark"] .avatar-preview {
      border-color: #374151;
      background: #1f2937;
    }
  `]
})
export class AvatarUploadComponent {
  avatarUrl = input<string | undefined>();
  avatarUrlChange = output<string | undefined>();

  urlInput = '';

  ngOnInit() {
    this.urlInput = this.avatarUrl() || '';
  }

  onUrlChange() {
    const url = this.urlInput.trim() || undefined;
    this.avatarUrlChange.emit(url);
  }
}

