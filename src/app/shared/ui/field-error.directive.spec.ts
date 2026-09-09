import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FieldErrorDirective} from './field-error.directive';

@Component({imports: [FieldErrorDirective], template: '<label>Name<input aria-describedby="help" [appFieldError]="error"></label><span id="help">Help</span>'})
class Host { error = ''; }

describe('field error associations', () => {
    it('associates validation text and removes only its own association when corrected', () => {
        const fixture = TestBed.createComponent(Host);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.hasAttribute('aria-invalid')).toBeFalse();
        fixture.componentInstance.error = 'Enter a name.';
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe('true');
        const errorId = input.getAttribute('aria-describedby')!.split(' ')[1];
        expect(fixture.nativeElement.querySelector(`#${errorId}`).textContent).toBe('Enter a name.');
        fixture.componentInstance.error = '';
        fixture.detectChanges();
        expect(input.getAttribute('aria-describedby')).toBe('help');
        expect(input.hasAttribute('aria-invalid')).toBeFalse();
    });
});
