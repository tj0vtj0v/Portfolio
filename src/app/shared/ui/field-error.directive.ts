import {Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, inject} from '@angular/core';

let nextErrorId = 0;

/** Native control with a feature-owned validation message and associated inline text. */
@Directive({selector: 'input[appFieldError], select[appFieldError], textarea[appFieldError]'})
export class FieldErrorDirective implements OnChanges, OnDestroy {
    @Input() appFieldError?: string;
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly renderer = inject(Renderer2);
    private readonly id = `field-error-${++nextErrorId}`;
    private message?: HTMLElement;

    ngOnChanges(): void {
        const ids = (this.host.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== this.id);
        if (this.appFieldError) {
            if (!this.message) {
                this.message = this.renderer.createElement('span');
                this.renderer.setAttribute(this.message, 'id', this.id);
                this.renderer.addClass(this.message, 'field-error');
                this.renderer.insertBefore(this.host.parentNode, this.message, this.host.nextSibling);
            }
            this.renderer.setProperty(this.message, 'textContent', this.appFieldError);
            ids.push(this.id);
            this.renderer.setAttribute(this.host, 'aria-invalid', 'true');
        } else {
            this.removeMessage();
            this.renderer.removeAttribute(this.host, 'aria-invalid');
        }
        if (ids.length) this.renderer.setAttribute(this.host, 'aria-describedby', ids.join(' '));
        else this.renderer.removeAttribute(this.host, 'aria-describedby');
    }

    ngOnDestroy(): void { this.removeMessage(); }
    private removeMessage(): void {
        if (this.message?.parentNode) this.renderer.removeChild(this.message.parentNode, this.message);
        this.message = undefined;
    }
}
