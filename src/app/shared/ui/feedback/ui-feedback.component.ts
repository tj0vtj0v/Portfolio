import {Component, Input} from '@angular/core';

export type FeedbackKind = 'info' | 'pending' | 'success' | 'warning' | 'error';

@Component({
    selector: 'app-ui-feedback',
    template: '<div class="ui-feedback" [attr.data-kind]="kind" [attr.role]="role" [attr.aria-live]="kind === \'error\' ? \'assertive\' : \'polite\'"><p>{{ message }}</p></div>'
})
export class UiFeedbackComponent {
    @Input() kind: FeedbackKind = 'info';
    @Input({required: true}) message = '';
    protected get role(): 'alert' | 'status' {
        return this.kind === 'error' ? 'alert' : 'status';
    }
}
