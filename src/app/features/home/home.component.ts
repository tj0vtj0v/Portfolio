import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProjectGalleryComponent} from '../portfolio/project-gallery.component';

@Component({selector: 'app-home', imports: [RouterLink, ProjectGalleryComponent], templateUrl: './home.component.html', styleUrls: ['../portfolio/portfolio.css', './home.component.css']})
export class HomeComponent {}
