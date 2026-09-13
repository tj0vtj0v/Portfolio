import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProjectDiagramComponent} from '../portfolio/project-diagram.component';
import {PortfolioPhotoComponent} from '../portfolio/portfolio-photo.component';
import {ImageComparisonComponent} from '../portfolio/image-comparison.component';

@Component({selector: 'app-projects', imports: [RouterLink, ProjectDiagramComponent, PortfolioPhotoComponent, ImageComparisonComponent], templateUrl: './projects.component.html', styleUrls: ['../portfolio/portfolio.css', './projects.component.css']})
export class ProjectsComponent {
    protected readonly mappingStage = signal(1);
    protected readonly stages = ['Building the map', 'Finished map'];
}
