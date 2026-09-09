import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

export type SkeletonLayout = 'accounting' | 'banking' | 'fuel' | 'table' | 'form' | 'page';

/** Presentation only: never fetches data or creates editable controls. */
@Component({
    selector: 'app-ui-skeleton',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p class="visually-hidden" role="status">{{ message }}</p>
        <div class="skeleton" aria-hidden="true">
            @if (pageHeader) {
                <div class="heading"><i class="bar short"></i><i class="bar title"></i><i class="bar description"></i></div>
                @if (isDashboard) { <div class="bar toolbar"></div> }
            }
            @if (layout === 'accounting' || layout === 'fuel') {
                <div class="summaries">@for (item of four; track $index) {
                    <div class="panel"><i class="bar short"></i><i class="bar value"></i></div>
                }</div>
            }
            @if (layout === 'accounting') {
                <div class="panel"><i class="bar short"></i><div class="chart" style="height: 96px"></div></div>
            }
            @if (isDashboard) {
                <div class="charts" [class.single]="layout === 'banking'" [class.accounting]="layout === 'accounting'">
                    @for (item of chartSlots; track $index) {
                        <div class="panel"><i class="bar short"></i><div class="chart"></div></div>
                    }
                </div>
            }
            @if (layout === 'table' || layout === 'accounting') {
                <div class="panel table"><i class="bar short"></i>
                    @for (row of rows; track $index) {
                        <div class="row">@for (cell of four; track $index) { <i class="bar"></i> }</div>
                    }
                </div>
            }
            @if (layout === 'form' || layout === 'page') {
                <div class="panel" [class.form]="layout === 'form'">
                    @for (item of four; track $index) { <div class="field"><i class="bar short"></i><i class="bar input"></i></div> }
                </div>
            }
        </div>
    `,
    styleUrl: './ui-skeleton.component.css'
})
export class UiSkeletonComponent {
    @Input() layout: SkeletonLayout = 'page';
    @Input() pageHeader = false;
    @Input() message = 'Loading content…';
    protected readonly four = [0, 1, 2, 3];
    protected readonly rows = [0, 1, 2, 3, 4, 5, 6, 7];
    protected get isDashboard(): boolean { return ['accounting', 'banking', 'fuel'].includes(this.layout); }
    protected get chartSlots(): number[] { return this.layout === 'fuel' ? this.four : this.layout === 'banking' ? [0] : this.four; }
}
