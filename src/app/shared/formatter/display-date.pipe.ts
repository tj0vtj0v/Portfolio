import {Pipe, PipeTransform} from '@angular/core';
import {DatePrecision, DisplayDateValue, displayDate} from './display-date';

@Pipe({name: 'displayDate'})
export class DisplayDatePipe implements PipeTransform {
    transform(value: DisplayDateValue, precision: DatePrecision = 'day'): string {
        return displayDate(value, precision);
    }
}
