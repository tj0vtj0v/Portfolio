import {Component, Input, computed, inject, signal} from '@angular/core';
import {EChartsCoreOption} from 'echarts';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import {chartThemeForOptions, themedChartOptions} from './chart-theme';
import {ThemeService} from '../../core/theme/theme.service';

@Component({
    selector: 'app-chart-card',
    imports: [NgxEchartsDirective],
    providers: [provideEchartsCore({echarts: () => import('echarts')})],
    template: `
        <section class="chart-card">
            @if (chartHasData(options)) {
                <div echarts [options]="presentationOptions" [merge]="themeOptions()" [autoResize]="true" class="chart"></div>
            } @else {
                <p class="empty" role="status">{{ emptyMessage }}</p>
            }
        </section>
    `,
    styles: `
        :host { display: block; min-width: 0; }
        .chart-card { min-width: 0; }
        .chart { width: 100%; height: var(--chart-height, 400px); }
        .empty { display: grid; place-items: center; min-height: 180px; margin: 0; color: var(--color-text-muted); border: 1px dashed var(--color-border); border-radius: var(--radius-panel); }
    `
})
export class ChartCardComponent {
    private readonly dataOptions = signal<EChartsCoreOption>({});
    protected presentationOptions: EChartsCoreOption = {};
    @Input({required: true}) set options(value: EChartsCoreOption) {
        this.dataOptions.set(value);
        this.presentationOptions = themedChartOptions(value);
    }
    get options(): EChartsCoreOption { return this.dataOptions(); }
    @Input() emptyMessage = 'No data for this period.';
    private readonly theme = inject(ThemeService);
    protected readonly themeOptions = computed(() => {
        this.theme.theme();
        return chartThemeForOptions(this.dataOptions());
    });
    protected readonly chartHasData = chartHasData;
}

export function chartHasData(options: EChartsCoreOption): boolean {
    const series = options['series'];
    const entries = Array.isArray(series) ? series : series ? [series] : [];
    const meaningful = (value: unknown): boolean => {
        if (typeof value === 'number') return Number.isFinite(value);
        if (Array.isArray(value)) return value.some(meaningful);
        if (value && typeof value === 'object') {
            const item = value as Record<string, unknown>;
            return meaningful(item['value']) || meaningful(item['links']);
        }
        return false;
    };
    return entries.some(entry => meaningful((entry as Record<string, unknown>)['data']) || meaningful((entry as Record<string, unknown>)['links']));
}
