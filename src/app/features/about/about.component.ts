import {afterNextRender, Component, DestroyRef, ElementRef, inject, NgZone, signal, ViewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CareerTimelineComponent} from './career-timeline.component';
import {PortfolioPhotoComponent} from '../portfolio/portfolio-photo.component';

@Component({selector: 'app-about', imports: [RouterLink, CareerTimelineComponent, PortfolioPhotoComponent], templateUrl: './about.component.html', styleUrls: ['../portfolio/portfolio.css', './about.component.css']})
export class AboutComponent {
    @ViewChild('skillsBands') private skillsBands?: ElementRef<HTMLElement>;
    private readonly destroyRef = inject(DestroyRef);
    private readonly zone = inject(NgZone);

    private readonly hoverTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.hoverTimers.forEach(timer => clearTimeout(timer));
            this.hoverTimers.clear();
        });
        afterNextRender(() => this.zone.runOutsideAngular(() => {
            const bands = this.skillsBands!.nativeElement;
            let visible = false;
            const update = () => bands.classList.toggle('offscreen', !visible || document.hidden);
            const observer = new IntersectionObserver(entries => {
                visible = entries[0].isIntersecting;
                update();
            });
            update();
            observer.observe(bands);
            document.addEventListener('visibilitychange', update);
            this.destroyRef.onDestroy(() => {
                observer.disconnect();
                document.removeEventListener('visibilitychange', update);
            });
        }));
    }

    protected setHoverSpeed(event: MouseEvent, speed: number): void {
        const window = event.currentTarget as HTMLElement;
        clearTimeout(this.hoverTimers.get(window));
        this.hoverTimers.delete(window);
        const apply = () => window.querySelector('.skills-track')?.getAnimations().forEach(animation => animation.updatePlaybackRate(speed));
        if (speed === 1) {
            apply();
        } else {
            this.zone.runOutsideAngular(() => {
                this.hoverTimers.set(window, setTimeout(() => {
                    this.hoverTimers.delete(window);
                    apply();
                }, 200));
            });
        }
    }

    protected readonly paused = signal(false);
    protected readonly skillRows = [
        {label: 'Topics & algorithms', items: ['Computer vision', 'Graph SLAM', 'EKF', 'Path planning', 'Photogrammetry', 'Aerial mapping', 'Retrieval-augmented generation']},
        {label: 'Languages & technologies', items: ['C++', 'Python', 'TypeScript', 'Angular', 'FastAPI', 'PostgreSQL', 'TensorRT', 'OpenCV']},
        {label: 'Methods & organisation', items: ['Git', 'Docker', 'CI/CD', 'Agile development', 'Project management', 'Validation', 'Flight mission planning']}
    ];
}
