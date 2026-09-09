import {EChartsCoreOption} from 'echarts';

export interface ChartColors {
    palette?: string[];
    text: string;
    muted: string;
    primary: string;
    secondary: string;
    border: string;
    surface: string;
    font: string;
    headingFont: string;
}

const CHART_PALETTE = ['#2c6557', '#b26135', '#4b72a6', '#95608d', '#92751d', '#3b8790', '#b14e60', '#718342'];

const FALLBACKS: ChartColors = {
    text: '#263e37', muted: '#667062', primary: '#2c6557', secondary: '#b5c2a2',
    border: '#d8d7bf', surface: '#fffcf0', font: 'system-ui, sans-serif', headingFont: 'Georgia, serif'
};

export function resolvedChartColors(root: Element = document.documentElement): ChartColors {
    const styles = getComputedStyle(root);
    const token = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    return {
        palette: CHART_PALETTE.map((fallback, index) => token(`--color-chart-${index + 1}`, fallback)),
        text: token('--color-chart-text', token('--color-text', FALLBACKS.text)),
        muted: token('--color-chart-legend', token('--color-text-muted', FALLBACKS.muted)),
        primary: token('--color-primary', FALLBACKS.primary),
        secondary: token('--color-chart-secondary', FALLBACKS.secondary),
        border: token('--color-border', FALLBACKS.border),
        surface: token('--color-surface', FALLBACKS.surface),
        font: token('--font-body', FALLBACKS.font),
        headingFont: token('--font-heading', FALLBACKS.headingFont)
    };
}

/** Presentation-only options, merged onto the live instance so data and interaction state survive a theme switch. */
export function chartThemeOptions(colors = resolvedChartColors()): EChartsCoreOption {
    const axis = {
        axisLine: {lineStyle: {color: colors.border}},
        axisTick: {lineStyle: {color: colors.border}},
        axisLabel: {color: colors.text},
        nameTextStyle: {color: colors.text},
        splitLine: {lineStyle: {color: colors.border}}
    };
    return {
        color: colors.palette ?? [colors.primary, ...CHART_PALETTE.slice(1)],
        backgroundColor: 'transparent',
        textStyle: {fontFamily: colors.font, color: colors.text},
        title: {textStyle: {color: colors.text, fontFamily: colors.headingFont}},
        legend: {textStyle: {color: colors.muted}},
        tooltip: {backgroundColor: colors.surface, borderColor: colors.border, textStyle: {color: colors.text}},
        xAxis: axis,
        yAxis: axis
    };
}

/** Axis-free charts must stay axis-free on both initial render and theme changes. */
export function chartThemeForOptions(options: EChartsCoreOption, colors = resolvedChartColors()): EChartsCoreOption {
    const theme = chartThemeOptions(colors);
    const series = options['series'];
    if (series) theme['series'] = (Array.isArray(series) ? series : [series]).map(() => ({
        label: {color: colors.text}, emphasis: {label: {color: colors.text}}
    }));
    if (!options['xAxis']) delete theme['xAxis'];
    if (!options['yAxis']) delete theme['yAxis'];
    return theme;
}

/** Compose fresh data with presentation before ngx-echarts replaces its option model. */
export function themedChartOptions(options: EChartsCoreOption, colors = resolvedChartColors()): EChartsCoreOption {
    const merge = (data: any, style: any): any => {
        if (Array.isArray(style)) {
            const entries = Array.isArray(data) ? data : data ? [data] : [];
            return style.map((item, index) => merge(entries[index], item));
        }
        if (!style || typeof style !== 'object') return style;
        if (Array.isArray(data)) return data.map(item => merge(item, style));
        const result = {...data};
        for (const key of Object.keys(style)) result[key] = merge(data?.[key], style[key]);
        return result;
    };
    return merge(options, chartThemeForOptions(options, colors));
}
