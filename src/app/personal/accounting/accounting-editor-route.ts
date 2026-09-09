import {ActivatedRoute, Router} from '@angular/router';

export interface AccountingEditorRequest {
    add: boolean;
    recordId?: number;
}

export function accountingEditorRequest(route: ActivatedRoute | null): AccountingEditorRequest {
    const params = route?.snapshot.queryParamMap;
    const rawId = params?.get('recordId') ?? '';
    const recordId = /^\d+$/.test(rawId) && Number.isSafeInteger(Number(rawId)) && Number(rawId) > 0 ? Number(rawId) : undefined;
    return {add: params?.get('mode') === 'add', recordId};
}

export function clearAccountingEditorQuery(router: Router | null, route: ActivatedRoute | null): void {
    if (!router || !route) return;
    void router.navigate([], {
        relativeTo: route,
        queryParams: {mode: null, recordId: null},
        queryParamsHandling: 'merge',
        replaceUrl: true
    });
}
