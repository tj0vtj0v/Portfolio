import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProjectDiagramComponent} from '../portfolio/project-diagram.component';

@Component({selector: 'app-projects', imports: [RouterLink, ProjectDiagramComponent], templateUrl: './projects.component.html', styleUrls: ['../portfolio/portfolio.css', './projects.component.css']})
export class ProjectsComponent {}
