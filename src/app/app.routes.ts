import {authGuard} from './core/auth/auth.guard';
import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        children: [
            {path: '', redirectTo: '/home', pathMatch: 'full'},
            {path: 'home', title: 'Portfolio', data: {shell: 'portfolio'}, loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)},
            {path: 'about', title: 'About', data: {shell: 'portfolio'}, loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)},
            {path: 'contact', title: 'Contact', data: {shell: 'portfolio'}, loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)},
            {path: 'imprint', title: 'Imprint', data: {shell: 'portfolio'}, loadComponent: () => import('./features/imprint/imprint.component').then(m => m.ImprintComponent)},
            {path: 'projects', title: 'Projects', data: {shell: 'portfolio'}, loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)},
            {path: 'login', title: 'Login', data: {shell: 'portfolio'}, loadComponent: () => import('./features/authentication/authentication.component').then(m => m.AuthenticationComponent)},
            {path: 'register', title: 'Register', data: {shell: 'portfolio'}, loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent)},
            {path: 'settings', title: 'Account settings', data: {shell: 'workspace'}, canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)},
            {path: 'account', title: 'Edit profile', data: {shell: 'workspace'}, canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)},
            {path: 'accounting', title: 'Expense Tracker', data: {shell: 'workspace', project: 'accounting'}, canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/accounting/accounting.routes').then(m => m.routes)},
            {path: 'fuel', title: 'Fuel Tracker', data: {shell: 'workspace', project: 'fuel'}, canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/fuel/fuel.routes').then(m => m.routes)},
            {path: '**', title: 'Page not found', data: {shell: 'portfolio'}, loadComponent: () => import('./features/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)}
        ]
    }
];
