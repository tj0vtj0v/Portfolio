import {TestBed} from '@angular/core/testing';
import {AMOUNT_PRIVACY_KEY, AmountPrivacyService} from './amount-privacy.service';
import {PrivateAmountComponent, PrivateAmountCellComponent} from './private-amount.component';
import {AmountPrivacyToggleComponent} from './amount-privacy-toggle.component';

describe('Amount privacy', () => {
    let stored: string | null;
    beforeEach(() => {
        stored = null;
        spyOn(Storage.prototype, 'getItem').and.callFake(key => key === AMOUNT_PRIVACY_KEY ? stored : null);
        spyOn(Storage.prototype, 'setItem').and.callFake((key, value) => { if (key === AMOUNT_PRIVACY_KEY) stored = value; });
    });

    it('defaults to visible and restores only a valid hidden preference', () => {
        for (const value of [null, 'false', 'invalid']) {
            stored = value;
            expect(new AmountPrivacyService().hidden()).toBeFalse();
        }
        const service = new AmountPrivacyService();
        service.toggle();
        expect(stored).toBe('true');
        expect(new AmountPrivacyService().hidden()).toBeTrue();
        service.toggle();
        expect(stored).toBe('false');
    });

    it('keeps working when browser storage is blocked', () => {
        (Storage.prototype.getItem as jasmine.Spy).and.throwError('blocked');
        (Storage.prototype.setItem as jasmine.Spy).and.throwError('blocked');
        const service = new AmountPrivacyService();
        expect(service.hidden()).toBeFalse();
        expect(() => service.toggle()).not.toThrow();
        expect(service.hidden()).toBeTrue();
    });

    it('redacts actual digits and accessible text, synchronizes mounted displays, and restores formatting', () => {
        const amount = TestBed.createComponent(PrivateAmountComponent);
        amount.componentRef.setInput('value', -1234.56);
        const cell = TestBed.createComponent(PrivateAmountCellComponent);
        cell.componentInstance.agInit({value: 9876.54, valueFormatted: '9876.54 €'} as any);
        const toggle = TestBed.createComponent(AmountPrivacyToggleComponent);
        [amount, cell, toggle].forEach(f => f.detectChanges());
        expect(cell.nativeElement.textContent).toContain('9876.54 €');
        toggle.nativeElement.querySelector('button').click();
        [amount, cell, toggle].forEach(f => f.detectChanges());
        for (const fixture of [amount, cell]) {
            expect(fixture.nativeElement.textContent.trim()).toBe('€');
            expect(fixture.nativeElement.querySelector('[aria-label="Amount hidden"]')).toBeTruthy();
            expect(fixture.nativeElement.innerHTML).not.toMatch(/1234|9876/);
        }
        expect(amount.nativeElement.querySelector('.redacted').firstElementChild.textContent).toBe('€');
        expect(cell.nativeElement.querySelector('.redacted').lastElementChild.textContent).toBe('€');
        expect(toggle.nativeElement.querySelector('button').getAttribute('aria-label')).toBe('Show amounts');
        toggle.nativeElement.querySelector('button').click();
        [amount, cell].forEach(f => f.detectChanges());
        expect(amount.nativeElement.textContent).toContain('1,234.56');
        expect(cell.nativeElement.textContent).toContain('9876.54 €');
    });
});
