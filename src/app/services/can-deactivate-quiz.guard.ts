import { CanDeactivateFn } from "@angular/router";
import { Observable } from "rxjs";
import { QuizTakingComponent } from "../pages/quiz/quiz-taking.component";

export const canDeactivateQuizGuard: CanDeactivateFn<QuizTakingComponent> = (
  component
): boolean | Observable<boolean> => {
  if (typeof component.canDeactivate === "function") {
    return component.canDeactivate();
  }
  return true;
};
