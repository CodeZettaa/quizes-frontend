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

  shareToLinkedIn(
    url: string,
    options?: { title?: string; summary?: string }
  ): void {
    const title = options?.title || "Quiz Result";
    const summary = options?.summary || "";

    const shareUrl =
      "https://www.linkedin.com/shareArticle?mini=true" +
      `&url=${encodeURIComponent(url)}` +
      `&title=${encodeURIComponent(title)}` +
      `&summary=${encodeURIComponent(summary)}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  postToLinkedIn(attemptId: string): Observable<LinkedInPostStatus> {
    return this.http.post<LinkedInPostStatus>(
      `${environment.apiUrl}/social/linkedin/post`,
      { attemptId }
    );
  }
}
