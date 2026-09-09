import {TestBed} from '@angular/core/testing';
import {ThemeService} from './theme.service';
import {THEME_STORAGE_KEY, applyTheme, isAppTheme, storedTheme, systemTheme} from './theme';

describe('Theme contract', () => {
    const originalTheme = document.documentElement.dataset['theme'];
    const originalStored = localStorage.getItem(THEME_STORAGE_KEY);

    afterEach(() => {
        if (originalTheme) document.documentElement.dataset['theme'] = originalTheme;
        else delete document.documentElement.dataset['theme'];
        if (originalStored) localStorage.setItem(THEME_STORAGE_KEY, originalStored);
        else localStorage.removeItem(THEME_STORAGE_KEY);
        TestBed.resetTestingModule();
    });

    it('accepts only supported stored values and survives blocked storage', () => {
        expect(isAppTheme('light')).toBeTrue();
        expect(isAppTheme('dark')).toBeTrue();
        expect(isAppTheme('sepia')).toBeFalse();
        expect(storedTheme({getItem: () => 'sepia'})).toBeUndefined();
        expect(storedTheme({getItem: () => { throw new Error('blocked'); }})).toBeUndefined();
    });

    it('resolves the system preference and applies it to the document root', () => {
        expect(systemTheme({matches: true} as MediaQueryList)).toBe('dark');
        expect(systemTheme({matches: false} as MediaQueryList)).toBe('light');
        applyTheme('dark');
        expect(document.documentElement.dataset['theme']).toBe('dark');
    });

    it('persists an explicit selection and updates the document immediately', () => {
        localStorage.removeItem(THEME_STORAGE_KEY);
        const service = TestBed.inject(ThemeService);
        service.setTheme('dark');
        expect(service.theme()).toBe('dark');
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(document.documentElement.dataset['theme']).toBe('dark');
        service.toggle();
        expect(service.theme()).toBe('light');
    });
});
