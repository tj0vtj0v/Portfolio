import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {AppTheme, DARK_THEME_QUERY, THEME_STORAGE_KEY, applyTheme, resolveTheme, storedTheme, systemTheme} from './theme';

@Injectable({providedIn: 'root'})
export class ThemeService {
    private readonly media = matchMedia(DARK_THEME_QUERY);
    private followsSystem = storedTheme() === undefined;
    readonly theme = signal<AppTheme>(resolveTheme());

    constructor() {
        applyTheme(this.theme());
        const onSystemChange = () => {
            if (this.followsSystem) this.update(systemTheme(this.media));
        };
        this.media.addEventListener('change', onSystemChange);
        inject(DestroyRef).onDestroy(() => this.media.removeEventListener('change', onSystemChange));
    }

    setTheme(theme: AppTheme): void {
        this.followsSystem = false;
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // A storage policy must not prevent the theme from changing for this session.
        }
        this.update(theme);
    }

    toggle(): void {
        this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
    }

    private update(theme: AppTheme): void {
        this.theme.set(theme);
        applyTheme(theme);
    }
}
