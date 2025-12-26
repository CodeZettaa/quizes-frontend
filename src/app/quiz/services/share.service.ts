import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ShareLinkResponse, LinkedInPostStatus } from "../models/share.models";

@Injectable({ providedIn: "root" })
export class ShareService {
  private readonly http = inject(HttpClient);

  createShareLink(attemptId: string): Observable<ShareLinkResponse> {
    return this.http.post<ShareLinkResponse>(
      `${environment.apiUrl}/share/quiz-attempt`,
      { attemptId }
    );
  }

  shareToLinkedIn(url: string, message?: string): void {
    // LinkedIn share URL format with summary parameter
    let shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    // Add message content if provided (LinkedIn may use this to pre-fill)
    if (message) {
      shareUrl += `&summary=${encodeURIComponent(message)}`;
    }
    
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  postToLinkedIn(attemptId: string): Observable<LinkedInPostStatus> {
    return this.http.post<LinkedInPostStatus>(
      `${environment.apiUrl}/social/linkedin/post`,
      { attemptId }
    );
  }
}
