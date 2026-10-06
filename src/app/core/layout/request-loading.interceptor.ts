import {inject} from '@angular/core';
import {HttpInterceptorFn} from '@angular/common/http';
import {finalize} from 'rxjs';
import {RequestLoadingService} from './request-loading.service';

export const requestLoadingInterceptor: HttpInterceptorFn = (request, next) => {
    const loading = inject(RequestLoadingService);
    loading.begin();
    return next(request).pipe(finalize(() => loading.end()));
};
