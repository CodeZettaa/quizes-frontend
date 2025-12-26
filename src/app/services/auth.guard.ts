import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/services/auth.service";

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated (has token)
  // Token validation happens asynchronously in the background
  if (auth.isAuthenticated()) {
    return true;
  }

  // Not authenticated, redirect to login with return URL
  const returnUrl = route.url.map((segment) => segment.path).join("/");
  router.navigate(["/auth/login"], {
    queryParams: returnUrl ? { returnUrl: `/${returnUrl}` } : {},
  });
  return false;
};
