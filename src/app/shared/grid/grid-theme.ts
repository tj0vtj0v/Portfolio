import {themeQuartz} from 'ag-grid-community';

/** One modern AG Grid v36 theme shared by every production grid. CSS variables keep it live across theme switches. */
export const portfolioGridTheme = themeQuartz.withParams({
    accentColor: 'var(--color-primary)',
    backgroundColor: 'var(--color-surface)',
    foregroundColor: 'var(--color-text)',
    borderColor: 'var(--color-border)',
    headerBackgroundColor: 'var(--color-surface-soft)',
    headerTextColor: 'var(--color-text)',
    oddRowBackgroundColor: 'color-mix(in srgb, var(--color-surface-soft) 45%, transparent)',
    rowHoverColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
    selectedRowBackgroundColor: 'color-mix(in srgb, var(--color-primary) 16%, transparent)',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    wrapperBorderRadius: 'var(--radius-panel)'
});
