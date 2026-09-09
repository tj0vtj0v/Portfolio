import {Directive, ElementRef, EventEmitter, Injectable, Injector, Output, afterNextRender, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AgGridAngular} from 'ag-grid-angular';
import {CellKeyDownEvent, RowClickedEvent} from 'ag-grid-community';

/** Scoped to one editor page so focus survives destruction/recreation of its grid. */
@Injectable()
export class EditorGridFocus {
    private readonly injector = inject(Injector);
    row?: number;
    column?: string;

    focusEditor(page: Element | null): void {
        afterNextRender(() => page?.querySelector<HTMLElement>('form input:not([disabled]), form select:not([disabled])')?.focus(), {injector: this.injector});
    }
}

@Directive({selector: 'ag-grid-angular[appGridActivate]'})
export class GridActivateDirective {
    private readonly grid = inject(AgGridAngular);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly focus = inject(EditorGridFocus);
    @Output() appGridActivate = new EventEmitter<RowClickedEvent | CellKeyDownEvent>();

    constructor() {
        this.grid.rowClicked.pipe(takeUntilDestroyed()).subscribe(event => this.activate(event));
        this.grid.cellKeyDown.pipe(takeUntilDestroyed()).subscribe(event => {
            const keyboard = event.event as KeyboardEvent | undefined;
            if (!keyboard || !('column' in event)) return;
            const target = keyboard.target as HTMLElement | null;
            if (target?.closest('input, select, textarea, button, a, [contenteditable="true"]')) return;
            if (keyboard.key === 'Enter' || keyboard.key === ' ') {
                keyboard.preventDefault();
                this.activate(event);
            }
        });
        this.grid.firstDataRendered.pipe(takeUntilDestroyed()).subscribe(({api}) => {
            if (this.focus.row === undefined || !api.getDisplayedRowCount()) return;
            const row = Math.min(this.focus.row, api.getDisplayedRowCount() - 1);
            const column = this.focus.column ?? api.getAllDisplayedColumns()[0]?.getColId();
            api.paginationGoToPage(Math.floor(row / api.paginationGetPageSize()));
            api.ensureIndexVisible(row);
            if (column) api.setFocusedCell(row, column);
            this.focus.row = undefined;
        });
    }

    private activate(event: RowClickedEvent | CellKeyDownEvent): void {
        if (!event.data) return;
        this.focus.row = event.rowIndex ?? 0;
        this.focus.column = event.api.getFocusedCell()?.column.getColId();
        const page = this.host.closest('.accounting-page, .fuel-page, .banking-page');
        this.appGridActivate.emit(event);
        this.focus.focusEditor(page);
    }
}
