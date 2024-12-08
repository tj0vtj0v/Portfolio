import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {AuthenticationComponent} from './features/authentication/authentication.component';
import {PrivateComponent} from './features/private/private.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'login', component: AuthenticationComponent},
    {path: 'private', component: PrivateComponent}
];
