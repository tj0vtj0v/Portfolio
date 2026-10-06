import {Injectable} from '@angular/core';
import {FilterModel} from 'ag-grid-community';
import {formatLocalDate} from '../date-range/period-range';

const STORAGE_PREFIX = 'portfolio.grid-filters.';

@Injectable({providedIn: 'root'})
export class GridFilterStateService {
    load(key: string): FilterModel | undefined {
        try {
            const value = window.sessionStorage.getItem(this.storageKey(key));
            if (value === null) return undefined;
            const parsed: unknown = JSON.parse(value);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as FilterModel : undefined;
        } catch {
            return undefined;
        }
    }

    save(key: string, model: FilterModel): void {
        try {
            window.sessionStorage.setItem(this.storageKey(key), JSON.stringify(model));
        } catch {
            // Session storage can be unavailable or full; grid filtering still works in memory.
        }
    }

    currentMonthFilterModel(): FilterModel {
        const today = new Date();
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
            date: {
                type: 'greaterThan',
                dateFrom: formatLocalDate(previousMonthEnd)
            }
        };
    }

    private storageKey(key: string): string {
        return `${STORAGE_PREFIX}${key}`;
    }
}
