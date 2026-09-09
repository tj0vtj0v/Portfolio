import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-ui-empty-state',
    template: `
        <section class="ui-empty-state">
            <h2>{{ heading }}</h2>
            <p>{{ message }}</p>
            <ng-content />
        </section>
    `
})
export class UiEmptyStateComponent {
    @Input({required: true}) heading = '';
    @Input({required: true}) message = '';
}
