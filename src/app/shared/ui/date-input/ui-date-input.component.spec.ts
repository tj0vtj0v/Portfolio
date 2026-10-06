import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {UiDateInputComponent} from './ui-date-input.component';

@Component({
    imports: [FormsModule, UiDateInputComponent],
    template: '<app-ui-date-input name="date" [(ngModel)]="value" />'
})
class HostComponent {
    value = '2025-06-15';
}

describe('UiDateInputComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HostComponent]});
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('renders Monday as the first weekday', () => {
        const trigger = fixture.nativeElement.querySelector('.ui-date-input__trigger') as HTMLButtonElement;
        trigger.click();
        fixture.detectChanges();

        const weekdays = Array.from(fixture.nativeElement.querySelectorAll('.ui-date-input__weekdays span'))
            .map(element => (element as HTMLElement).textContent);
        expect(weekdays).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('writes a selected day back through ngModel', () => {
        const trigger = fixture.nativeElement.querySelector('.ui-date-input__trigger') as HTMLButtonElement;
        trigger.click();
        fixture.detectChanges();
        (fixture.nativeElement.querySelector('[aria-label="2025-06-16"]') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toBe('2025-06-16');
    });
});
