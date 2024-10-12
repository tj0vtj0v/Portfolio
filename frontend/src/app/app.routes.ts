import {Routes} from '@angular/router';
import {AuthenticationComponent} from "./features/authentication/authentication.component";
import {HomeComponent} from "./features/home/home.component";
import {AboutComponent} from "./features/about/about.component";
import {ProjectsComponent} from "./features/projects/projects.component";
import {PrivateComponent} from "./features/private/private.component";
import {PageNotFoundComponent} from "./features/page-not-found/page-not-found.component";

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'login', component: AuthenticationComponent},
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'projects', component: ProjectsComponent},
    {path: 'private', component: PrivateComponent},
    {path: '**', component: PageNotFoundComponent}
];
