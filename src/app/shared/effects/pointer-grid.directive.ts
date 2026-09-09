import {Directive, ElementRef, NgZone, OnDestroy, inject} from '@angular/core';

const POINTER_MEDIA = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

@Directive({selector: '[appPointerGrid]'})
export class PointerGridDirective implements OnDestroy {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly zone = inject(NgZone);
    private readonly media = matchMedia(POINTER_MEDIA);
    private frame?: number;
    private x = -300;
    private y = -300;
    private listening = false;

    private readonly onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || !this.media.matches) return;
        this.x = event.clientX;
        this.y = event.clientY;
        if (this.frame === undefined) this.frame = requestAnimationFrame(() => this.paint());
    };
    private readonly clear = () => this.hide();
    private readonly onPointerOut = (event: PointerEvent) => {
        if (event.relatedTarget === null) this.hide();
    };
    private readonly onPreferenceChange = () => this.syncListeners();

    constructor() {
        this.zone.runOutsideAngular(() => {
            this.media.addEventListener('change', this.onPreferenceChange);
            this.syncListeners();
        });
    }

    ngOnDestroy(): void {
        this.media.removeEventListener('change', this.onPreferenceChange);
        this.removeListeners();
        this.hide();
    }

    private syncListeners(): void {
        const maskingSupported = CSS.supports('mask-image', 'radial-gradient(circle, #000, transparent)') ||
            CSS.supports('-webkit-mask-image', 'radial-gradient(circle, #000, transparent)');
        if (this.media.matches && maskingSupported) this.addListeners();
        else {
            this.removeListeners();
            this.hide();
        }
    }

    private addListeners(): void {
        if (this.listening) return;
        this.listening = true;
        window.addEventListener('pointermove', this.onPointerMove, {passive: true});
        window.addEventListener('pointerout', this.onPointerOut, {passive: true});
        window.addEventListener('blur', this.clear);
    }

    private removeListeners(): void {
        if (!this.listening) return;
        this.listening = false;
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerout', this.onPointerOut);
        window.removeEventListener('blur', this.clear);
    }

    private paint(): void {
        this.frame = undefined;
        this.host.style.setProperty('--pointer-x', `${this.x}px`);
        this.host.style.setProperty('--pointer-y', `${this.y}px`);
        this.host.classList.add('pointer-grid-active');
    }

    private hide(): void {
        if (this.frame !== undefined) cancelAnimationFrame(this.frame);
        this.frame = undefined;
        this.host.classList.remove('pointer-grid-active');
    }
}
