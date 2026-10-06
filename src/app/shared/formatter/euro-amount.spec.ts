import {euroAmount, spaceEuroPrefix} from './euro-amount';

describe('Euro amount presentation', () => {
    it('spaces leading euros without changing trailing symbols or other currencies', () => {
        expect(euroAmount(1234.56)).toBe('€ 1,234.56');
        expect(euroAmount(-1234.56)).toBe('-€ 1,234.56');
        expect(euroAmount(0)).toBe('€ 0.00');
        expect(euroAmount(null)).toBe('');
        expect(spaceEuroPrefix('€ 12.00')).toBe('€ 12.00');
        expect(spaceEuroPrefix('12.00 €')).toBe('12.00 €');
        expect(spaceEuroPrefix('$12.00')).toBe('$12.00');
    });

    it('uses a spaced trailing euro for monthly comparison', () => {
        expect(euroAmount(1234.56, 'en', 'suffix')).toBe('1,234.56 €');
        expect(euroAmount(0, 'en', 'suffix')).toBe('0.00 €');
    });
});
