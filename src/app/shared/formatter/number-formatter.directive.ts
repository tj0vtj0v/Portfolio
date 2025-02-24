import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
    standalone: true,
    selector: '[numberFormatter]'
})
export class NumberFormatterDirective {
    constructor(private elementRef: ElementRef) {
    }

    @HostListener('input', ['$event'])
    onInputChange(event: Event) {
        const input = this.elementRef.nativeElement as HTMLInputElement;
        let value = input.value;

        value = value.replace(/,/g, '.') // accept commas for points
        value = value.replace(/[^0-9.]/g, ''); // remove all non number characters

        // remove all points but the first one
        const firstPeriodIndex = value.indexOf('.');
        if (firstPeriodIndex !== -1) {
            value = value.slice(0, firstPeriodIndex + 1) + value.slice(firstPeriodIndex + 1).replace(/\./g, '');
        }

        input.value = value
    }
}
