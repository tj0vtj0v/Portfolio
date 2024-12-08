import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutComponent} from './features/about/about.component';
import {HomeComponent} from './features/home/home.component';
import {PageNotFoundComponent} from './features/page-not-found/page-not-found.component';
import {PrivateComponent} from './features/private/private.component';
import {ProjectsComponent} from './features/projects/projects.component';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterOutlet} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';


@NgModule({
    providers: [
        provideHttpClient()
    ],
    declarations: [
        AboutComponent,
        HomeComponent,
        PageNotFoundComponent,
        PrivateComponent,
        ProjectsComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        RouterOutlet,
        RouterLink
    ]
})
export class AppModule {
}
