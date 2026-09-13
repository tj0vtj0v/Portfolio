import {Component, Input} from '@angular/core';
import {SLAM_SNAPSHOTS} from './slam-snapshots';

@Component({selector: 'app-slam-diagram', templateUrl: './slam-diagram.component.html', styleUrl: './slam-diagram.component.css'})
export class SlamDiagramComponent {
    @Input() localization = false;
    @Input() stage = 1;
    @Input() compact = false;
    protected get snapshot() { return SLAM_SNAPSHOTS[this.localization ? 'skidpad' : this.stage === 0 ? 'slam_building' : 'slam_finished']; }
}
