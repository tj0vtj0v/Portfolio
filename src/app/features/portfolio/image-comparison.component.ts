import {Component, ElementRef, Input, ViewChild, signal} from '@angular/core';

@Component({
    selector: 'app-image-comparison',
    templateUrl: './image-comparison.component.html',
    styleUrl: './image-comparison.component.css'
})
export class ImageComparisonComponent {
    @Input() leftSrc = '';
    @Input() rightSrc = '';
    @Input() leftSrcset = '';
    @Input() rightSrcset = '';
    @Input() sizes = '100vw';
    @Input() leftLabel = 'Before';
    @Input() rightLabel = 'After';
    @Input() aspectRatio = '1 / 1';
    @Input() width = 1;
    @Input() height = 1;
    @ViewChild('frame') private frame?: ElementRef<HTMLElement>;
    protected readonly split = signal(50);
    private dragging = false;

    protected startDrag(event: PointerEvent): void {
        event.preventDefault();
        this.dragging = true;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        this.updateFromClientX(event.clientX);
    }

    protected drag(event: PointerEvent): void {
        if (this.dragging) this.updateFromClientX(event.clientX);
    }

    protected stopDrag(): void { this.dragging = false; }

    protected keydown(event: KeyboardEvent): void {
        let value: number | undefined;
        if (event.key === 'ArrowLeft') value = this.split() - 5;
        if (event.key === 'ArrowRight') value = this.split() + 5;
        if (event.key === 'Home') value = 0;
        if (event.key === 'End') value = 100;
        if (value === undefined) return;
        event.preventDefault();
        this.split.set(this.clamp(value));
    }

    protected valueText(): string {
        return `${this.leftLabel} ${Math.round(this.split())} percent visible; ${this.rightLabel} ${Math.round(100 - this.split())} percent visible`;
    }

    protected leftLabelHidden(): boolean { return this.split() < 18; }

    protected rightLabelHidden(): boolean { return this.split() > 82; }

    private updateFromClientX(clientX: number): void {
        const bounds = this.frame?.nativeElement.getBoundingClientRect();
        if (!bounds || bounds.width === 0) return;
        this.split.set(this.clamp((clientX - bounds.left) / bounds.width * 100));
    }

    private clamp(value: number): number { return Math.min(100, Math.max(0, value)); }
}
