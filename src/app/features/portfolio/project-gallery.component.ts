import {afterNextRender, Component, ElementRef, ViewChild, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProjectDiagramComponent} from './project-diagram.component';

@Component({
    selector: 'app-project-gallery',
    imports: [RouterLink, ProjectDiagramComponent],
    templateUrl: './project-gallery.component.html',
    styleUrl: './project-gallery.component.css'
})
export class ProjectGalleryComponent {
    @ViewChild('track') private track?: ElementRef<HTMLElement>;
    protected readonly selected = signal(2);
    constructor() {
        afterNextRender(() => {
            const track = this.track?.nativeElement;
            const item = track?.children[this.selected()] as HTMLElement | undefined;
            if (track && item) track.scrollLeft = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
        });
    }
    protected readonly projects = [
        {title: 'Personal workspace', fragment: 'web-tools', image: '', kind: 'web' as const, label: 'Web development'},
        {title: 'Camera perception', fragment: 'perception', image: '/images/portfolio/perception.png', kind: 'mapping' as const, label: 'Computer vision'},
        {title: 'Formula Student', fragment: 'formula-student', image: '/images/portfolio/jenny.jpg', kind: 'mapping' as const, label: 'Fast Forest'},
        {title: 'Graph SLAM', fragment: 'mapping', image: '', kind: 'mapping' as const, label: 'Mapping · In development'},
        {title: 'A VTOL of my own', fragment: 'vtol', image: '/images/portfolio/vtol-concept.jpg', kind: 'mapping' as const, label: 'Planned · AI concept'}
    ];

    protected select(index: number): void {
        this.selected.set(Math.max(0, Math.min(this.projects.length - 1, index)));
        this.track?.nativeElement.children[this.selected()]?.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'nearest', inline: 'center'
        });
    }
}
