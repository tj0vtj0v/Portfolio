import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {AuthenticationComponent} from './features/authentication/authentication.component';
import {BankingComponent} from './private/banking/banking.component';
import {PageNotFoundComponent} from './features/page-not-found/page-not-found.component';
import {AboutComponent} from './features/about/about.component';
import {ProjectsComponent} from './features/projects/projects.component';
import {AccountingComponent} from './private/accounting/accounting.component';
import {ProximityComponent} from './private/proximity/proximity.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'projects', component: ProjectsComponent},
    {path: 'login', component: AuthenticationComponent},
    {path: 'banking', component: BankingComponent},
    {path: "accounting", component: AccountingComponent},
    {path: "proximity", component: ProximityComponent},
    {path: '**', component: PageNotFoundComponent}
];
