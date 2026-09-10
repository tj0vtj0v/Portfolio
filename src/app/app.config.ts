import {authInterceptor} from './core/auth/auth.interceptor';
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withInMemoryScrolling} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes, withInMemoryScrolling({anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled'})), provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync()]
};
