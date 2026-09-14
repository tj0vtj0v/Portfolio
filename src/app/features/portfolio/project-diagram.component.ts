import {Component, Input} from '@angular/core';
import {PerceptionDiagramComponent} from './perception-diagram.component';
import {SlamDiagramComponent} from './slam-diagram.component';

export type DiagramKind = 'mapping' | 'localization' | 'web' | 'delivery' | 'perception' | 'pipeline' | 'vtol';

@Component({
    selector: 'app-project-diagram',
    imports: [SlamDiagramComponent, PerceptionDiagramComponent],
    templateUrl: './project-diagram.component.html',
    styleUrl: './project-diagram.component.css'
})
export class ProjectDiagramComponent {
    @Input() compact = false;
    @Input() kind: DiagramKind = 'mapping';
    @Input() stage = 2;
    @Input() photoSizes = '(max-width: 800px) calc(100vw - 44px), 960px';
}
