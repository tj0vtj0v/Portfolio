import {Component, Input, signal} from '@angular/core';
import {PORTFOLIO_PHOTOS, PortfolioPhotoName} from './portfolio-photos';

@Component({
    selector: 'app-portfolio-photo',
    host: {'[style.aspect-ratio]': 'ratio', '[class.cropped]': 'crop', '[class.concept]': 'concept'},
    template: `
        <span class="preview" [class.hidden]="loaded()" aria-hidden="true" [style.background-image]="'url(' + photo.preview + ')'" [style.background-position]="position"></span>
        <img [src]="photo.src" [srcset]="photo.srcset" [sizes]="sizes" [alt]="alt"
            [width]="photo.width" [height]="photo.height" [style.object-position]="position"
            [attr.loading]="priority ? 'eager' : 'lazy'" [attr.fetchpriority]="priority ? 'high' : 'auto'"
            decoding="async" [class.loaded]="loaded()" (load)="loaded.set(true)" (error)="loaded.set(true)">
    `,
    styles: `
        :host { display: block; position: relative; overflow: hidden; width: 100%; border-radius: var(--radius-panel); background: var(--color-art-background); }
        .preview, img { position: absolute; inset: 0; width: 100%; height: 100%; }
        .preview { background-size: cover; filter: blur(8px); transform: scale(1.05); }
        img { display: block; object-fit: cover; opacity: 0; transition: opacity 180ms ease; }
        img.loaded { opacity: 1; }
        :host(.cropped) img, :host(.cropped) .preview { transform: scale(1.12); transform-origin: top left; }
        .preview.hidden { opacity: 0; }
        :host(.concept) { isolation: isolate; }
        :host(.concept) img { filter: var(--art-concept-filter); mix-blend-mode: var(--art-concept-blend); }
        :host(.concept) .preview { filter: blur(8px) var(--art-concept-filter); mix-blend-mode: var(--art-concept-blend); }
        @media (prefers-reduced-motion: reduce) { img { transition: none; } }
    `
})
export class PortfolioPhotoComponent {
    private photoName: PortfolioPhotoName = 'jenny';
    protected readonly loaded = signal(false);
    @Input({required: true}) set name(value: PortfolioPhotoName) {
        if (value !== this.photoName) this.loaded.set(false);
        this.photoName = value;
    }
    @Input() alt = '';
    @Input() sizes = '(max-width: 580px) calc(100vw - 44px), (max-width: 800px) 45vw, 550px';
    @Input() ratio = '3 / 2';
    @Input() position = '50% 50%';
    @Input() priority = false;
    @Input() crop = false;
    @Input() concept = false;
    protected get photo() { return PORTFOLIO_PHOTOS[this.photoName]; }
}
