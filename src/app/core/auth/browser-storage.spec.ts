import {browserStorage, readStoredValue} from './browser-storage';
import {storedTheme} from '../theme/theme';

describe('unavailable browser storage', () => {
    it('handles a denied storage getter before theme bootstrap or session reads', () => {
        spyOnProperty(window, 'localStorage', 'get').and.throwError('denied');
        expect(storedTheme()).toBeUndefined();
        expect(browserStorage()).toBeUndefined();
        expect(readStoredValue('token')).toBeNull();
    });
    it('handles denied storage methods', () => {
        spyOn(Storage.prototype, 'getItem').and.throwError('denied');
        expect(storedTheme()).toBeUndefined();
        expect(readStoredValue('token')).toBeNull();
    });
});
