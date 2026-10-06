import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-ui-page-header',
    template: `
        <header class="ui-page-header">
            <div class="ui-page-header__copy">
                @if (eyebrow) { <p class="ui-page-header__eyebrow">{{ eyebrow }}</p> }
                <div class="ui-page-header__title"><h1>{{ heading }}</h1><ng-content select="[title-actions]" /></div>
                @if (description) { <p class="ui-page-header__description">{{ description }}</p> }
            </div>
            <div class="ui-page-header__actions"><ng-content /></div>
        </header>
    `,
    styles: `.ui-page-header__title { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-2); min-width: 0; }`
})
export class UiPageHeaderComponent {
    @Input({required: true}) heading = '';
    @Input() eyebrow = '';
    @Input() description = '';
}
