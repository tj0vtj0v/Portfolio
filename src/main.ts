/// <reference types="@angular/localize" />

import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {initializeTheme} from './app/core/theme/theme';

initializeTheme();
bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
