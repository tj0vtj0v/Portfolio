import {inject} from '@angular/core';
import {FeedbackKind, NotificationService} from './notification.service';

/** Retains form state while publishing every event, including identical retries. */
export class FeedbackMessage {
    private readonly notifications = inject(NotificationService);
    private current = '';

    constructor(private readonly kind: FeedbackKind | ((message: string) => FeedbackKind)) {}

    get value(): string { return this.current; }
    set value(message: string) {
        this.current = message;
        this.notifications.show(message, typeof this.kind === 'function' ? this.kind(message) : this.kind);
    }
}
