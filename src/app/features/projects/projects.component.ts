import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProjectDiagramComponent} from '../portfolio/project-diagram.component';
import {PortfolioPhotoComponent} from '../portfolio/portfolio-photo.component';
import {ImageComparisonComponent} from '../portfolio/image-comparison.component';
import {ProjectionDiagramComponent} from '../portfolio/projection-diagram.component';

@Component({selector: 'app-projects', imports: [RouterLink, ProjectDiagramComponent, PortfolioPhotoComponent, ImageComparisonComponent, ProjectionDiagramComponent], templateUrl: './projects.component.html', styleUrls: ['../portfolio/portfolio.css', './projects.component.css']})
export class ProjectsComponent {
    protected readonly mappingStage = signal(0);
    protected readonly stages = ['Building the map', 'Finished map'];
}
