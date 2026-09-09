import {EventEmitter} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {AgGridAngular} from 'ag-grid-angular';
import {GridFitDirective} from './grid-fit.directive';

describe('GridFitDirective', () => {
    it('fits on ready and container resize, skips hidden/destroyed grids, and unsubscribes on destruction', () => {
        const gridReady = new EventEmitter<any>();
        const gridSizeChanged = new EventEmitter<any>();
        const api = {isDestroyed: jasmine.createSpy().and.returnValue(false), sizeColumnsToFit: jasmine.createSpy()};
        TestBed.configureTestingModule({providers: [{provide: AgGridAngular, useValue: {gridReady, gridSizeChanged}}]});
        TestBed.runInInjectionContext(() => new GridFitDirective());
        gridReady.emit({api});
        gridSizeChanged.emit({api, clientWidth: 800});
        gridSizeChanged.emit({api, clientWidth: 0});
        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(2);
        api.isDestroyed.and.returnValue(true);
        gridSizeChanged.emit({api, clientWidth: 800});
        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(2);
        TestBed.resetTestingModule();
        api.isDestroyed.and.returnValue(false);
        gridReady.emit({api});
        gridSizeChanged.emit({api, clientWidth: 800});
        expect(api.sizeColumnsToFit).toHaveBeenCalledTimes(2);
    });
});
