import {afterNextRender, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DiagramKind, ProjectDiagramComponent} from './project-diagram.component';
import {PortfolioPhotoComponent} from './portfolio-photo.component';
import {PortfolioPhotoName} from './portfolio-photos';

interface GalleryProject {title: string; fragment: string; kind?: DiagramKind; stage?: number; photo?: PortfolioPhotoName; image?: string; imageSrcset?: string}

@Component({selector: 'app-project-gallery', imports: [RouterLink, ProjectDiagramComponent, PortfolioPhotoComponent], templateUrl: './project-gallery.component.html', styleUrl: './project-gallery.component.css'})
export class ProjectGalleryComponent {
    @ViewChild('viewport') private viewport?: ElementRef<HTMLElement>;
    @ViewChild('track') private track?: ElementRef<HTMLElement>;
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly projects: readonly GalleryProject[] = [
        {title: 'This Website', fragment: 'web-tools', kind: 'web'},
        {title: 'Drone mapping', fragment: 'drone-mapping', image: '/images/portfolio/drone-comparison.png', imageSrcset: '/images/portfolio/responsive/drone-comparison-320.png 320w, /images/portfolio/responsive/drone-comparison-640.png 640w, /images/portfolio/responsive/drone-comparison-960.png 960w'},
        {title: 'Camera Perception', fragment: 'perception', image: '/images/portfolio/perception-inference.png'},
        {title: 'Graph SLAM', fragment: 'mapping', kind: 'mapping', stage: 1},
        {title: 'Self-built VTOL', fragment: 'vtol', kind: 'vtol'}
    ];
    protected readonly items = [0, 1, 2].flatMap(copy => this.projects.map((project, index) => ({project, index, copy})));
    protected readonly selected = signal(0);
    protected readonly focusedItem = signal(this.projects.length);
    protected readonly reduced = signal(false);
    protected readonly announcement = signal('');
    private phase = 0;
    private hoverStartedAt: number | undefined;
    private focusWithin = false;
    private visible = false;

    constructor() {
        afterNextRender(() => this.start());
    }

    protected advance(delta: number): void {
        this.phase = this.wrap(Math.round(this.phase) + delta);
        this.position();
        this.announcement.set(this.projects[this.selected()].title);
    }
    protected focus(index: number): void { this.phase = index; this.focusWithin = true; this.position(); }
    protected hover(value: boolean): void { this.hoverStartedAt = value ? performance.now() : undefined; }
    protected focusChanged(event: FocusEvent): void {
        this.focusWithin = this.viewport?.nativeElement.contains(event.relatedTarget as Node) ?? false;
    }
    protected keydown(event: KeyboardEvent): void {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        this.advance(event.key === 'ArrowLeft' ? -1 : 1);
    }
    private wrap(value: number): number { return (value + this.projects.length) % this.projects.length; }
    private position(): void {
        const viewport = this.viewport?.nativeElement, track = this.track?.nativeElement;
        if (!viewport || !track) return;
        const step = Math.max(190, viewport.clientWidth / 3);
        track.style.setProperty('--gallery-slot', `${step}px`);
        const offset = viewport.clientWidth / 2 - step / 2 - (this.projects.length + this.phase) * step;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
        const physical = this.projects.length + Math.round(this.phase);
        if (this.focusedItem() !== physical) this.zone.run(() => {
            this.focusedItem.set(physical);
            this.selected.set(this.wrap(Math.round(this.phase)));
        });
    }
    private start(): void {
        const viewport = this.viewport!.nativeElement;
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const motionChanged = () => this.zone.run(() => this.reduced.set(media.matches));
        motionChanged();
        media.addEventListener('change', motionChanged);
        let frame = 0, previous = performance.now();
        const resize = new ResizeObserver(() => this.position());
        resize.observe(viewport);
        const visibility = new IntersectionObserver(entries => { this.visible = entries[0].isIntersecting; });
        visibility.observe(viewport);
        this.zone.runOutsideAngular(() => {
            const tick = (now: number) => {
                const elapsed = Math.min(now - previous, 64);
                previous = now;
                if (this.visible && !document.hidden && !this.reduced() && !this.focusWithin) {
                    this.phase = this.wrap(this.phase + elapsed / 8750 * (this.hoverStartedAt !== undefined && now - this.hoverStartedAt >= 200 ? 0.5 : 1));
                    this.position();
                }
                frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        });
        this.position();
        this.destroyRef.onDestroy(() => { cancelAnimationFrame(frame); resize.disconnect(); visibility.disconnect(); media.removeEventListener('change', motionChanged); });
    }
}
