export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'portfolio.theme';
export const DARK_THEME_QUERY = '(prefers-color-scheme: dark)';

export function isAppTheme(value: unknown): value is AppTheme {
    return value === 'light' || value === 'dark';
}

export function storedTheme(storage?: Pick<Storage, 'getItem'>): AppTheme | undefined {
    try {
        const value = (storage ?? localStorage).getItem(THEME_STORAGE_KEY);
        return isAppTheme(value) ? value : undefined;
    } catch {
        return undefined;
    }
}

export function systemTheme(media: Pick<MediaQueryList, 'matches'> = matchMedia(DARK_THEME_QUERY)): AppTheme {
    return media.matches ? 'dark' : 'light';
}

export function resolveTheme(): AppTheme {
    return storedTheme() ?? systemTheme();
}

export function applyTheme(theme: AppTheme, root: HTMLElement = document.documentElement): void {
    root.dataset['theme'] = theme;
}

export function initializeTheme(): AppTheme {
    const theme = resolveTheme();
    applyTheme(theme);
    return theme;
}
