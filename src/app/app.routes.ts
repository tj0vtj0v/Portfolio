import {authGuard} from './core/auth/auth.guard';
import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        children: [
            {path: '', redirectTo: '/home', pathMatch: 'full'},
            {path: 'home', title: 'Tjorven Burdorf · Portfolio', data: {shell: 'portfolio'}, loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)},
            {path: 'about', title: 'About · Tjorven Burdorf', data: {shell: 'portfolio'}, loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)},
            {path: 'contact', title: 'Contact · Tjorven Burdorf', data: {shell: 'portfolio'}, loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)},
            {path: 'imprint', data: {shell: 'portfolio'}, loadComponent: () => import('./features/imprint/imprint.component').then(m => m.ImprintComponent)},
            {path: 'projects', title: 'Projects · Tjorven Burdorf', data: {shell: 'portfolio'}, loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)},
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
