export interface QuizSharePayload {
  quizId: string;
  attemptId: string;
  score: number; // percentage or numeric
  correctAnswersCount: number;
  totalQuestions: number;
  pointsEarned: number;
  subject?: string;
  level?: 'beginner' | 'middle' | 'intermediate';
  finishedAt?: string;
}

export interface ShareLinkResponse {
  url: string;              // public URL to share (must be accessible without auth)
  ogTitle?: string;         // optional
  ogDescription?: string;   // optional
}

export interface LinkedInPostStatus {
  status: 'posted';
  postUrl?: string;
}

