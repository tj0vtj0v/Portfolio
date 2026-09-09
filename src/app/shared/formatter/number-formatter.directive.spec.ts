import {ElementRef} from '@angular/core';
import { NumberFormatterDirective } from './number-formatter.directive';

describe('NumberFormatterDirective', () => {
  it('should create an instance', () => {
    const directive = new NumberFormatterDirective(new ElementRef(document.createElement('input')));
    expect(directive).toBeTruthy();
  });
});
