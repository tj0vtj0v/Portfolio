import {Component} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {PointerGridDirective} from './pointer-grid.directive';

@Component({imports: [PointerGridDirective], template: '<div appPointerGrid></div>'})
class PointerGridHostComponent {}

describe('PointerGridDirective', () => {
    let fixture: ComponentFixture<PointerGridHostComponent>;
    let mediaListener: (() => void) | undefined;
    let matches = true;

    beforeEach(() => {
        spyOn(window, 'matchMedia').and.callFake(() => ({
            get matches() { return matches; },
            addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => mediaListener = listener as () => void,
            removeEventListener: () => mediaListener = undefined
        } as unknown as MediaQueryList));
        spyOn(CSS, 'supports').and.returnValue(true);
        TestBed.configureTestingModule({imports: [PointerGridHostComponent]});
        fixture = TestBed.createComponent(PointerGridHostComponent);
        fixture.detectChanges();
    });

    it('coalesces mouse movement, hides for preference changes, and removes listeners on destroy', fakeAsync(() => {
        const host = fixture.nativeElement.firstElementChild as HTMLElement;
        window.dispatchEvent(new PointerEvent('pointermove', {pointerType: 'mouse', clientX: 120, clientY: 80}));
        tick(20);
        expect(host.style.getPropertyValue('--pointer-x')).toBe('120px');
        expect(host.style.getPropertyValue('--pointer-y')).toBe('80px');
        expect(host.classList).toContain('pointer-grid-active');

        matches = false;
        mediaListener?.();
        expect(host.classList).not.toContain('pointer-grid-active');
        fixture.destroy();
        matches = true;
        window.dispatchEvent(new PointerEvent('pointermove', {pointerType: 'mouse', clientX: 20, clientY: 20}));
        tick(20);
        expect(host.style.getPropertyValue('--pointer-x')).toBe('120px');
    }));
});
