import {Component, Input} from '@angular/core';

let panelSequence = 0;

@Component({
    selector: 'app-ui-panel',
    template: `
        <section class="ui-panel" [attr.aria-labelledby]="heading ? headingId : null">
            @if (eyebrow || heading) {
                <header class="ui-panel__header">
                    <div class="ui-panel__copy">
                        @if (eyebrow) { <p class="ui-panel__eyebrow">{{ eyebrow }}</p> }
                        @if (heading) { <h2 [id]="headingId">{{ heading }}</h2> }
                    </div>
                    <div class="ui-panel__actions"><ng-content select="[panel-actions]" /></div>
                </header>
            }
            <div class="ui-panel__body"><ng-content /></div>
        </section>
    `
})
export class UiPanelComponent {
    @Input() eyebrow = '';
    @Input() heading = '';
    protected readonly headingId = `ui-panel-heading-${++panelSequence}`;
}
