import {Component, Input, OnChanges, OnDestroy, inject} from '@angular/core';
import {FeedbackKind, NotificationService} from './notification.service';

export type {FeedbackKind} from './notification.service';

@Component({
    selector: 'app-ui-feedback',
    template: '',
    styles: ':host { display: none; }'
})
export class UiFeedbackComponent implements OnChanges, OnDestroy {
    private readonly notifications = inject(NotificationService);
    @Input() kind: FeedbackKind = 'info';
    @Input({required: true}) message = '';
    ngOnChanges(): void {
        this.notifications.release(this);
        this.notifications.show(this.message, this.kind, this);
    }
    ngOnDestroy(): void { this.notifications.release(this); }
}
