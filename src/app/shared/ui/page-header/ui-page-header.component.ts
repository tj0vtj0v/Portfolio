import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-ui-page-header',
    template: `
        <header class="ui-page-header">
            <div class="ui-page-header__copy">
                @if (eyebrow) { <p class="ui-page-header__eyebrow">{{ eyebrow }}</p> }
                <h1>{{ heading }}</h1>
                @if (description) { <p class="ui-page-header__description">{{ description }}</p> }
            </div>
            <div class="ui-page-header__actions"><ng-content /></div>
        </header>
    `
})
export class UiPageHeaderComponent {
    @Input({required: true}) heading = '';
    @Input() eyebrow = '';
    @Input() description = '';
}
