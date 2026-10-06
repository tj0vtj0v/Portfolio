import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {UiSelectComponent} from './ui-select.component';

interface TestOption { id: number; name: string; }

@Component({
    imports: [FormsModule, UiSelectComponent],
    template: '<app-ui-select name="option" [(ngModel)]="value" [options]="options" placeholder="Choose an option" />'
})
class HostComponent {
    value?: TestOption;
    options: TestOption[] = Array.from({length: 8}, (_, index) => ({id: index + 1, name: `Option ${index + 1}`}));
}

describe('UiSelectComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HostComponent]});
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('opens a scrollable option list and keeps all options available', () => {
        const trigger = fixture.nativeElement.querySelector('.ui-select__trigger') as HTMLButtonElement;
        trigger.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.ui-select__option').length).toBe(8);
        expect((fixture.nativeElement.querySelector('.ui-select__menu') as HTMLElement).getAttribute('role')).toBe('listbox');
    });

    it('writes the selected object back through ngModel', () => {
        const trigger = fixture.nativeElement.querySelector('.ui-select__trigger') as HTMLButtonElement;
        trigger.click();
        fixture.detectChanges();
        (fixture.nativeElement.querySelectorAll('.ui-select__option')[2] as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(fixture.componentInstance.options[2]);
        expect((fixture.nativeElement.querySelector('.ui-select__trigger') as HTMLElement).textContent).toContain('Option 3');
    });

    it('supports first-letter search and repeated-letter cycling', () => {
        fixture.componentInstance.options = [
            {id: 1, name: 'Travel'},
            {id: 2, name: 'Taxi'},
            {id: 3, name: 'Food'}
        ];
        fixture.detectChanges();
        const trigger = fixture.nativeElement.querySelector('.ui-select__trigger') as HTMLButtonElement;

        trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 't'}));
        fixture.detectChanges();
        expect(fixture.componentInstance.value?.name).toBe('Travel');

        trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 't'}));
        fixture.detectChanges();
        expect(fixture.componentInstance.value?.name).toBe('Taxi');
    });
});
