import {convertToParamMap} from '@angular/router';
import {accountingEditorRequest, clearAccountingEditorQuery} from './accounting-editor-route';

describe('Accounting editor route state', () => {
    it('accepts only the known add flag and a positive integer record ID', () => {
        const route = (values: Record<string, string>) => ({snapshot: {queryParamMap: convertToParamMap(values)}} as any);
        expect(accountingEditorRequest(route({mode: 'add'}))).toEqual({add: true, recordId: undefined});
        expect(accountingEditorRequest(route({mode: 'edit', recordId: '12'}))).toEqual({add: false, recordId: 12});
        expect(accountingEditorRequest(route({recordId: '-1'}))).toEqual({add: false, recordId: undefined});
        expect(accountingEditorRequest(route({recordId: '2.5'}))).toEqual({add: false, recordId: undefined});
        expect(accountingEditorRequest(route({recordId: '9007199254740993'}))).toEqual({add: false, recordId: undefined});
    });

    it('clears editor-only query state with replaceUrl', () => {
        const router = {navigate: jasmine.createSpy().and.resolveTo(true)} as any;
        const route = {} as any;
        clearAccountingEditorQuery(router, route);
        expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
            relativeTo: route, queryParams: {mode: null, recordId: null}, queryParamsHandling: 'merge', replaceUrl: true
        }));
    });
});
