import {authGuard} from './core/auth/auth.guard';
import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        children: [
            {path: '', redirectTo: '/accounting', pathMatch: 'full'},
            {path: 'home', redirectTo: '/accounting', pathMatch: 'full'},
            {path: 'about', redirectTo: '/accounting', pathMatch: 'full'},
            {path: 'contact', redirectTo: '/accounting', pathMatch: 'full'},
            {path: 'imprint', data: {shell: 'portfolio'}, loadComponent: () => import('./features/imprint/imprint.component').then(m => m.ImprintComponent)},
            {path: 'projects', redirectTo: '/accounting', pathMatch: 'full'},
            {path: 'login', data: {shell: 'portfolio'}, loadComponent: () => import('./features/authentication/authentication.component').then(m => m.AuthenticationComponent)},
            {path: 'register', data: {shell: 'portfolio'}, loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent)},
            {path: 'settings', data: {shell: 'workspace'}, canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)},
            {path: 'account', data: {shell: 'workspace'}, canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)},
            {path: 'accounting', data: {shell: 'workspace', project: 'accounting'}, canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/accounting/accounting.routes').then(m => m.routes)},
            {path: 'fuel', data: {shell: 'workspace', project: 'fuel'}, canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/fuel/fuel.routes').then(m => m.routes)},
            {path: '**', data: {shell: 'portfolio'}, loadComponent: () => import('./features/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)}
        ]
    }
];
