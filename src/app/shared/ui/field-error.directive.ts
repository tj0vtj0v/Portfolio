import {Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, inject} from '@angular/core';

let nextErrorId = 0;

/** Form control with a feature-owned validation message and associated inline text. */
@Directive({selector: 'input[appFieldError], select[appFieldError], textarea[appFieldError], app-ui-select[appFieldError], app-ui-date-input[appFieldError]'})
export class FieldErrorDirective implements OnChanges, OnDestroy {
    @Input() appFieldError?: string;
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly renderer = inject(Renderer2);
    private readonly id = `field-error-${++nextErrorId}`;
    private message?: HTMLElement;

    ngOnChanges(): void {
        const targets = this.targets();
        const ids = new Set(targets.flatMap(target => (target.getAttribute('aria-describedby') ?? '').split(/\s+/)));
        ids.delete('');
        ids.delete(this.id);
        if (this.appFieldError) {
            if (!this.message) {
                this.message = this.renderer.createElement('span');
                this.renderer.setAttribute(this.message, 'id', this.id);
                this.renderer.addClass(this.message, 'field-error');
                this.renderer.insertBefore(this.host.parentNode, this.message, this.host.nextSibling);
            }
            this.renderer.setProperty(this.message, 'textContent', this.appFieldError);
            ids.add(this.id);
            targets.forEach(target => this.renderer.setAttribute(target, 'aria-invalid', 'true'));
        } else {
            this.removeMessage();
            targets.forEach(target => this.renderer.removeAttribute(target, 'aria-invalid'));
        }
        targets.forEach(target => {
            if (ids.size) this.renderer.setAttribute(target, 'aria-describedby', [...ids].join(' '));
            else this.renderer.removeAttribute(target, 'aria-describedby');
        });
    }

    ngOnDestroy(): void { this.removeMessage(); }
    private removeMessage(): void {
        if (this.message?.parentNode) this.renderer.removeChild(this.message.parentNode, this.message);
        this.message = undefined;
    }

    private targets(): HTMLElement[] {
        const control = this.host.querySelector<HTMLButtonElement>('button');
        return control ? [this.host, control] : [this.host];
    }
}
