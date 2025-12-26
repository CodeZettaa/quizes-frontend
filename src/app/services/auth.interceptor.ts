import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  // Add Authorization header if token exists
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token is invalid or expired
      if (error.status === 401) {
        // Only clear auth if we have a token (avoid clearing on initial load errors)
        if (auth.token()) {
          // Clear auth state
          auth.logout();
          
          // Only redirect if not already on auth pages
          const currentPath = router.url;
          if (!currentPath.startsWith('/auth/')) {
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: currentPath }
            });
          }
        }
      }
      
      return throwError(() => error);
    })
  );
}
