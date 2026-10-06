import {fakeAsync, tick, TestBed} from '@angular/core/testing';
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
        expect(fixture.nativeElement.querySelector('.skills-bands').classList.contains('paused')).toBeTrue();
        button.click();
        fixture.detectChanges();
        expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('slows skills only after sustained hover and cancels brief passes', fakeAsync(() => {
        const fixture = TestBed.createComponent(AboutComponent);
        fixture.detectChanges();
        const viewport: HTMLElement = fixture.nativeElement.querySelector('.skills-window');
        const track: HTMLElement = viewport.querySelector('.skills-track')!;
        const updatePlaybackRate = jasmine.createSpy('updatePlaybackRate');
        spyOn(track, 'getAnimations').and.returnValue([{updatePlaybackRate} as unknown as Animation]);
        viewport.dispatchEvent(new MouseEvent('mouseenter'));
        tick(199);
        expect(updatePlaybackRate).not.toHaveBeenCalled();
        tick(1);
        expect(updatePlaybackRate).toHaveBeenCalledWith(0.5);
        viewport.dispatchEvent(new MouseEvent('mouseleave'));
        expect(updatePlaybackRate).toHaveBeenCalledWith(1);
        updatePlaybackRate.calls.reset();
        viewport.dispatchEvent(new MouseEvent('mouseenter'));
        tick(100);
        viewport.dispatchEvent(new MouseEvent('mouseleave'));
        tick(200);
        expect(updatePlaybackRate.calls.allArgs()).toEqual([[1]]);
        viewport.dispatchEvent(new MouseEvent('mouseenter'));
        fixture.destroy();
        updatePlaybackRate.calls.reset();
        tick(200);
        expect(updatePlaybackRate).not.toHaveBeenCalled();
    }));

    it('wraps gallery navigation and announces manual selection', () => {
        const fixture = TestBed.createComponent(ProjectGalleryComponent);
        fixture.detectChanges();
        const gallery: HTMLElement = fixture.nativeElement.querySelector('.gallery-window');
        const next = {click: () => gallery.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}))};
        const previous = {click: () => gallery.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}))};
        next.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[aria-live]').textContent).toContain('Drone mapping');
        next.click(); next.click(); next.click(); next.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.selected a').getAttribute('href')).toBe('/projects#web-tools');
        previous.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.selected a').getAttribute('href')).toBe('/projects#vtol');
        expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
        expect(fixture.nativeElement.querySelectorAll('.gallery-item.selected').length).toBe(1);
        expect(fixture.nativeElement.querySelectorAll('.gallery-item:not([aria-hidden])').length).toBe(5);
    });
});
