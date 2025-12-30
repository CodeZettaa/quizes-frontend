import { Routes } from "@angular/router";
import { authGuard } from "./services/auth.guard";
import { adminGuard } from "./services/admin.guard";
import { LoginComponent } from "./pages/auth/login.component";
import { RegisterComponent } from "./pages/auth/register.component";
import { TopicSelectionComponent } from "./pages/auth/topic-selection.component";
import { SocialCallbackPageComponent } from "./auth/pages/social-callback/social-callback-page.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { QuizSelectionComponent } from "./pages/quiz/quiz-selection.component";
import { QuizTakingComponent } from "./pages/quiz/quiz-taking.component";
import { QuizReviewComponent } from "./pages/quiz/quiz-review.component";
import { canDeactivateQuizGuard } from "./services/can-deactivate-quiz.guard";
import { AttemptDetailsComponent } from "./pages/attempts/attempt-details.component";
import { ProfilePageComponent } from "./user/pages/profile-page/profile-page.component";
import { SettingsPageComponent } from "./user/pages/settings-page/settings-page.component";
import { LeaderboardPageComponent } from "./user/pages/leaderboard-page/leaderboard-page.component";
import { AdminSubjectsComponent } from "./pages/admin/admin-subjects.component";
import { AdminQuizzesComponent } from "./pages/admin/admin-quizzes.component";

export const appRoutes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  {
    path: "auth",
    children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: "social/callback", component: SocialCallbackPageComponent },
      { path: "topics", component: TopicSelectionComponent, canActivate: [authGuard] },
    ],
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: "subject/:subjectId/level/:level",
    component: QuizSelectionComponent,
    canActivate: [authGuard],
  },
  {
    path: "quiz/:quizId",
    component: QuizTakingComponent,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateQuizGuard],
  },
  {
    path: "quiz/attempt/:attemptId/review",
    component: QuizReviewComponent,
    canActivate: [authGuard],
  },
  {
    path: "attempts/:attemptId",
    component: AttemptDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: "profile",
    component: ProfilePageComponent,
    canActivate: [authGuard],
  },
  {
    path: "settings",
    component: SettingsPageComponent,
    canActivate: [authGuard],
  },
  {
    path: "leaderboard",
    component: LeaderboardPageComponent,
    canActivate: [authGuard],
  },
  {
    path: "admin/subjects",
    component: AdminSubjectsComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: "admin/quizzes",
    component: AdminQuizzesComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: "**", redirectTo: "dashboard" },
];
