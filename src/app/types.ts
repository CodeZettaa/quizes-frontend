export type UserRole = 'student' | 'admin';
export type PreferredLevel = 'beginner' | 'middle' | 'intermediate' | 'mixed';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  primarySubject?: string; // 'HTML' | 'CSS' | 'JS' | 'Angular' | 'React' | 'NextJS' | 'NestJS' | 'NodeJS'
  preferredLevel?: PreferredLevel;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  totalPoints: number;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  streakDays: number;
  perSubjectStats: Array<{
    subject: string;
    quizzesTaken: number;
    averageScore: number;
    totalPoints: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  totalPoints: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options: AnswerOption[];
}

export interface Quiz {
  id: string;
  title: string;
  level: 'beginner' | 'middle' | 'intermediate';
  subject: Subject;
  questions: Question[];
  hasTaken?: boolean; // Only present when user is authenticated
  createdAt?: string;
}

export interface QuizAttempt {
  id: string;
  quiz: {
    id: string;
    title: string;
    subject: Subject | null;
    level: string;
  };
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  pointsEarned: number;
  startedAt: string;
  finishedAt: string;
}

export interface QuizAttemptDetail extends QuizAttempt {
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    userAnswer: {
      selectedOptionId: string;
      isCorrect: boolean;
    } | null;
  }>;
}

export interface QuizSubmissionResult {
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  pointsEarned: number;
  updatedUserTotalPoints: number;
  correctAnswers?: Array<{
    questionId: string;
    correctOptionId: string;
  }>;
}

export interface ArticleRecommendation {
  id: string;
  title: string;
  url: string;
  provider: string;
  estimatedReadingTimeMinutes?: number;
  subject?: string;
  level?: 'beginner' | 'middle' | 'intermediate';
}

export interface WrongAnswerFeedback {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  correctOptionId: string;
  explanation?: string;
  suggestedArticles: ArticleRecommendation[];
}

export interface SubmitQuizResponse {
  attemptId?: string; // Optional: backend may not return this yet
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  pointsEarned: number;
  updatedUserTotalPoints: number;
  wrongAnswers: WrongAnswerFeedback[];
}
