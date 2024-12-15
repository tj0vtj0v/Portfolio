import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {AuthenticationComponent} from './features/authentication/authentication.component';
import {BankingComponent} from './private/banking/banking.component';
import {PageNotFoundComponent} from './features/page-not-found/page-not-found.component';
import {AboutComponent} from './features/about/about.component';
import {ProjectsComponent} from './features/projects/projects.component';
import {AccountingComponent} from './private/accounting/accounting.component';
import {ProximityComponent} from './private/proximity/proximity.component';
import {ContactComponent} from './features/contact/contact.component';
import {ImprintComponent} from './features/imprint/imprint.component';
import {RegisterComponent} from './features/register/register.component';
import {RequestComponent} from './features/request/request.component';
import {AccountComponent} from './features/account/account.component';
import {SettingsComponent} from './features/settings/settings.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'contact', component: ContactComponent},
    {path: 'imprint', component: ImprintComponent},
    {path: 'projects', component: ProjectsComponent},
    {path: 'login', component: AuthenticationComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'request', component: RequestComponent},
    {path: 'account', component: AccountComponent},
    {path: 'banking', component: BankingComponent},
    {path: "accounting", component: AccountingComponent},
    {path: "proximity", component: ProximityComponent},
    {path: '**', component: PageNotFoundComponent}
];
