import {CommonModule} from '@angular/common';
import {Component, ElementRef, HostListener, booleanAttribute, forwardRef, inject, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

interface CalendarDay {
    date: string;
    day: number;
    isToday: boolean;
}

let nextDateInputId = 0;

@Component({
    selector: 'app-ui-date-input',
    imports: [CommonModule],
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiDateInputComponent), multi: true}],
    templateUrl: './ui-date-input.component.html',
    styleUrl: './ui-date-input.component.css'
})
export class UiDateInputComponent implements ControlValueAccessor {
    @Input() id = `ui-date-input-${++nextDateInputId}`;
    @Input() name = '';
    @Input() placeholder = 'Choose a date';
    @Input({transform: booleanAttribute}) required = false;
    @Input() disabled = false;

    protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    protected readonly calendarId = `${this.id}-calendar`;
    protected value = '';
    protected opened = false;
    protected month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    private disabledByForm = false;
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    protected get isDisabled(): boolean { return this.disabled || this.disabledByForm; }
    protected get monthLabel(): string {
        return new Intl.DateTimeFormat('en-GB', {month: 'long', year: 'numeric'}).format(this.month);
    }
    protected get displayValue(): string {
        if (!this.value) return this.placeholder;
        return new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(this.parseDate(this.value));
    }
    protected get hasValue(): boolean { return Boolean(this.value); }
    protected get calendarDays(): readonly (CalendarDay | null)[] {
        const firstWeekday = (this.month.getDay() + 6) % 7;
        const daysInMonth = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0).getDate();
        const days: (CalendarDay | null)[] = Array.from({length: firstWeekday}, () => null);
        for (let day = 1; day <= daysInMonth; day++) {
            const date = this.dateKey(this.month.getFullYear(), this.month.getMonth(), day);
            days.push({date, day, isToday: date === this.todayKey()});
        }
        return days;
    }

    writeValue(value: unknown): void {
        this.value = typeof value === 'string' ? value : '';
        const parsed = this.value ? this.parseDate(this.value) : undefined;
        if (parsed && !Number.isNaN(parsed.getTime())) this.month = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    }

    registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
    setDisabledState(isDisabled: boolean): void { this.disabledByForm = isDisabled; }

    protected toggle(event: MouseEvent): void {
        event.stopPropagation();
        if (this.isDisabled) return;
        if (this.opened) this.close();
        else this.open();
    }

    protected onTriggerKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            if (!this.opened) this.open();
        } else if (event.key === 'Escape' && this.opened) {
            event.preventDefault();
            this.close();
        }
    }

    protected previousMonth(): void {
        this.month = new Date(this.month.getFullYear(), this.month.getMonth() - 1, 1);
    }

    protected nextMonth(): void {
        this.month = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 1);
    }

    protected selectDay(day: CalendarDay): void {
        if (this.isDisabled) return;
        this.value = day.date;
        this.onChange(this.value);
        this.onTouched();
        this.close();
        this.focusTrigger();
    }

    protected clear(): void {
        if (this.required || this.isDisabled) return;
        this.value = '';
        this.onChange(this.value);
        this.onTouched();
        this.close();
        this.focusTrigger();
    }

    protected isSelected(day: CalendarDay): boolean { return day.date === this.value; }

    @HostListener('document:click', ['$event'])
    protected onDocumentClick(event: MouseEvent): void {
        if (this.opened && !this.host.nativeElement.contains(event.target as Node)) this.close();
    }

    private open(): void {
        if (this.isDisabled) return;
        if (this.value) {
            const selected = this.parseDate(this.value);
            this.month = new Date(selected.getFullYear(), selected.getMonth(), 1);
        }
        this.opened = true;
    }

    private close(): void {
        if (!this.opened) return;
        this.opened = false;
        this.onTouched();
    }

    private focusTrigger(): void {
        this.host.nativeElement.querySelector<HTMLButtonElement>('.ui-date-input__trigger')?.focus();
    }

    private dateKey(year: number, month: number, day: number): string {
        return `${year.toString().padStart(4, '0')}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    private todayKey(): string {
        const today = new Date();
        return this.dateKey(today.getFullYear(), today.getMonth(), today.getDate());
    }

    private parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
}
