import {CommonModule} from '@angular/common';
import {Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
    customPeriodRange, formatLocalDate, formatPeriodLabel, PERIOD_PRESETS, PeriodPreset, PeriodRange, periodRange
} from './period-range';
import {isValidPeriodQuery, parsePeriodQuery, serializePeriodQuery} from './period-query';
import {FieldErrorDirective} from '../ui/field-error.directive';

@Component({
    selector: 'app-date-range',
    imports: [CommonModule, FormsModule, FieldErrorDirective],
    template: `
        <section class="period-toolbar" aria-label="Dashboard period">
            <span class="period-label" id="dashboard-period-label">Period</span>
            <div class="period-presets" role="group" aria-labelledby="dashboard-period-label">
                <button *ngFor="let preset of presets" type="button"
                    [attr.aria-pressed]="period === preset.value" (click)="selectPeriod(preset.value)">{{ preset.label }}</button>
            </div>
            <div *ngIf="period === 'custom'" class="custom-range">
                <label for="dashboard-from">From</label>
                <input id="dashboard-from" name="from" type="date" [(ngModel)]="from" (ngModelChange)="applyCustom()" [appFieldError]="error">
                <label for="dashboard-to">To</label>
                <input id="dashboard-to" name="to" type="date" [(ngModel)]="to" (ngModelChange)="applyCustom()" [appFieldError]="error">
            </div>
            <p *ngIf="error" class="period-error" role="alert">{{ error }}</p>
            <p *ngIf="current" class="period-summary">
                {{ label }}
                <span *ngIf="current.observedTo < current.to">Data shown through {{ current.observedTo }}.</span>
            </p>
        </section>
    `,
    styles: `
        :host { display: block; }
        .period-toolbar { display: flex; align-items: end; flex-wrap: wrap; gap: var(--space-2) var(--space-3); padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-panel); background: var(--color-surface); }
        .period-presets { display: flex; flex-wrap: wrap; gap: var(--space-2); min-width: 0; }
        .period-presets button[aria-pressed="true"] { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }
        label, .period-label { align-self: center; margin: 0; font-size: var(--font-size-label); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
        select, input { min-height: var(--control-min-height); }
        .custom-range { display: flex; flex-basis: 100%; align-items: center; flex-wrap: wrap; gap: var(--space-2); }
        .period-summary, .period-error { flex-basis: 100%; margin: 0; }
        .period-summary { color: var(--color-text-muted); }
        .period-summary span { margin-left: var(--space-2); }
        .period-error { color: var(--color-danger); }
        @media (max-width: 580px) { select, .custom-range, .custom-range input { width: 100%; } .custom-range label { width: 100%; } }
    `
})
export class DateRangeComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    @Input() earliest?: string;
    @Output() rangeChange = new EventEmitter<PeriodRange | null>();
    protected readonly presets = PERIOD_PRESETS;
    protected period: PeriodPreset = 'year';
    protected from = '';
    protected to = '';
    protected error = '';
    protected current?: PeriodRange;
    protected label = '';

    ngOnInit(): void {
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(query => {
            const range = parsePeriodQuery(query);
            this.setRange(range);
            if (!isValidPeriodQuery(query)) this.navigate(range, true);
        });
    }

    protected selectPeriod(period: PeriodPreset): void {
        this.period = period;
        this.error = '';
        if (period === 'custom') {
            this.current = undefined;
            this.from = '';
            this.to = this.startOfMonth();
            this.rangeChange.emit(null);
            return;
        }
        this.navigate(periodRange(period));
    }

    protected applyCustom(): void {
        if (!this.to) this.to = this.startOfMonth();
        const range = customPeriodRange(this.from, this.to);
        if (!range) {
            this.current = undefined;
            this.label = '';
            this.error = !this.from || !this.to ? 'Choose both From and To dates.' : 'From must be on or before To.';
            this.rangeChange.emit(null);
            return;
        }
        this.error = '';
        this.navigate(range);
    }

    private startOfMonth(): string {
        const today = new Date();
        return formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    private navigate(range: PeriodRange, replaceUrl = false): void {
        void this.router.navigate([], {relativeTo: this.route, queryParams: serializePeriodQuery(range), replaceUrl});
    }

    private setRange(range: PeriodRange): void {
        this.period = range.period;
        this.from = range.from ?? '';
        this.to = range.to;
        this.current = range;
        this.error = '';
        this.label = formatPeriodLabel(range, this.earliest);
        this.rangeChange.emit(range);
    }
}
