import {authGuard} from './core/auth/auth.guard';
import {Routes} from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)},
    {path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)},
    {path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)},
    {path: 'imprint', loadComponent: () => import('./features/imprint/imprint.component').then(m => m.ImprintComponent)},
    {path: 'projects', loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)},
    {path: 'login', loadComponent: () => import('./features/authentication/authentication.component').then(m => m.AuthenticationComponent)},
    {path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent)},
    {path: 'settings', canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)},
    {path: 'account', canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)},
    {path: 'accounting', canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/accounting/accounting.routes').then(m => m.routes)},
    {path: 'fuel', canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/fuel/fuel.routes').then(m => m.routes)},
    {path: 'banking', canActivate: [authGuard], canActivateChild: [authGuard], loadChildren: () => import('./personal/banking/banking.routes').then(m => m.routes)},
    {path: 'proximity', canActivate: [authGuard], canActivateChild: [authGuard], loadComponent: () => import('./personal/proximity/proximity.component').then(m => m.ProximityComponent)},
    {path: '**', loadComponent: () => import('./features/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)}
];
