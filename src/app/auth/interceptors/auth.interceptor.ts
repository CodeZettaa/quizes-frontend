import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // If token exists, clone request and add Authorization header
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token is invalid or expired
      if (error.status === 401) {
        // Only clear auth if we have a token (avoid clearing on initial load errors)
        if (authService.getToken()) {
          authService.clearAuth();
          
          // Only redirect if not already on auth pages
          const currentPath = router.url;
          if (!currentPath.startsWith("/auth/")) {
            router.navigate(["/auth/login"], {
              queryParams: { returnUrl: currentPath },
            });
          }
        }
      }
      
      return throwError(() => error);
    })
  );
};
