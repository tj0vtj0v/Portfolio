import {inject} from '@angular/core';
import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {catchError, from, switchMap, throwError, takeUntil} from 'rxjs';
import {API_BASE_URL, AuthService, SKIP_AUTH} from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    if ((!request.url.startsWith(API_BASE_URL) && !request.url.startsWith('/api/')) || request.context.get(SKIP_AUTH)) return next(request);

    const auth = inject(AuthService);
    const authorize = (original: HttpRequest<unknown>) => {
        const authorization = auth.authorization;
        return authorization ? original.clone({setHeaders: {Authorization: authorization}}) : original;
    };

    const authenticated = auth.authorization !== null;
    const response = next(authorize(request)).pipe(catchError(error => {
        if (error.error?.detail !== 'Authorisation token expired') return throwError(() => error);
        // Retry through the remaining chain once; retry failures propagate to the caller.
        return from(auth.refresh()).pipe(switchMap(() => next(authorize(request))));
    }));
    return authenticated ? response.pipe(takeUntil(auth.sessionEnded$)) : response;
};
