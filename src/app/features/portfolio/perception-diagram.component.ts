import {Component, Input, signal} from '@angular/core';
import {PortfolioPhotoComponent} from './portfolio-photo.component';
import {PERCEPTION_LAYOUT} from './perception-layout';
@Component({selector: 'app-perception-diagram', imports: [PortfolioPhotoComponent], templateUrl: './perception-diagram.component.html', styleUrl: './perception-diagram.component.css'})
export class PerceptionDiagramComponent {
    @Input() compact = false;
    protected readonly layout = PERCEPTION_LAYOUT;
    protected readonly step = signal(0);
    protected readonly steps = ['Original camera image', 'Image preparation', 'Model input', 'Inference', 'Transform back onto the original image'];
    protected move(delta: number): void {
        this.step.update(value => Math.max(0, Math.min(this.steps.length - 1, value + delta)));
    }
}
