import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppComponent} from './app.component';
import {AuthenticationComponent} from './features/authentication/authentication.component';
import {AboutComponent} from './features/about/about.component';
import {HomeComponent} from './features/home/home.component';
import {PageNotFoundComponent} from './features/page-not-found/page-not-found.component';
import {PrivateComponent} from './features/private/private.component';
import {ProjectsComponent} from './features/projects/projects.component';
import {FormsModule} from '@angular/forms';
import {HeaderComponent} from './core/header/header.component';
import {FooterComponent} from './core/footer/footer.component';
import {RouterLink, RouterOutlet} from '@angular/router';



@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        AuthenticationComponent,
        HomeComponent,
        PageNotFoundComponent,
        PrivateComponent,
        ProjectsComponent,
        HeaderComponent,
        FooterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterOutlet,
        RouterLink
    ]
})
export class AppModule { }
