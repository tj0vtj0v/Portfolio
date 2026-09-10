import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {AboutComponent} from '../about/about.component';
import {ProjectGalleryComponent} from './project-gallery.component';

describe('Portfolio interactions', () => {
    beforeEach(() => TestBed.configureTestingModule({providers: [provideRouter([])]}));

    it('pauses and resumes the skills band with an exposed button state', () => {
        const fixture = TestBed.createComponent(AboutComponent);
        fixture.detectChanges();
        const button: HTMLButtonElement = fixture.nativeElement.querySelector('.motion-control');
        button.click();
        fixture.detectChanges();
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(fixture.nativeElement.querySelector('.skills-window').classList.contains('paused')).toBeTrue();
        button.click();
        fixture.detectChanges();
        expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('selects gallery projects, announces the selection, and stops at the endpoints', () => {
        const fixture = TestBed.createComponent(ProjectGalleryComponent);
        fixture.detectChanges();
        spyOn(Element.prototype, 'scrollIntoView');
        const highlights: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.image-button');
        highlights[0].click();
        fixture.detectChanges();
        const previous: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Previous project"]');
        const next: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Next project"]');
        expect(previous.disabled).toBeTrue();
        expect(highlights[0].getAttribute('aria-pressed')).toBe('true');
        next.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[aria-live]').textContent).toContain('Camera perception');
        expect(highlights[0].getAttribute('aria-pressed')).toBe('false');
        highlights[4].click();
        fixture.detectChanges();
        expect(next.disabled).toBeTrue();
        expect(fixture.nativeElement.querySelector('.selected a').getAttribute('href')).toBe('/projects#vtol');
    });
});
