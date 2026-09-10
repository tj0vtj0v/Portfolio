import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-project-diagram',
    templateUrl: './project-diagram.component.html',
    styleUrl: './project-diagram.component.css'
})
export class ProjectDiagramComponent {
    @Input() kind: 'mapping' | 'web' = 'mapping';
}
