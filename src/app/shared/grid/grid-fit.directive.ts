import {Directive, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AgGridAngular} from 'ag-grid-angular';
import {AllCommunityModule, GridApi, ModuleRegistry} from 'ag-grid-community';
import {portfolioGridTheme} from './grid-theme';

@Directive({selector: 'ag-grid-angular[appGridFit]'})
export class GridFitDirective {
    private readonly grid = inject(AgGridAngular);

    constructor() {
        ModuleRegistry.registerModules([AllCommunityModule]);
        this.grid.theme = portfolioGridTheme;
        this.grid.gridReady.pipe(takeUntilDestroyed()).subscribe(event => this.fit(event.api));
        this.grid.gridSizeChanged.pipe(takeUntilDestroyed()).subscribe(event => {
            if (event.clientWidth > 0) this.fit(event.api);
        });
    }

    private fit(api: GridApi): void {
        if (!api.isDestroyed()) api.sizeColumnsToFit();
    }
}
