import {AfterViewChecked, Component, ElementRef, inject, viewChild} from '@angular/core';
import {NotificationService} from './notification.service';

@Component({
    selector: 'app-notification-stack',
    templateUrl: './notification-stack.component.html',
    styleUrl: './notification-stack.component.css'
})
export class NotificationStackComponent implements AfterViewChecked {
    protected readonly feedback = inject(NotificationService);
    private readonly stack = viewChild<ElementRef<HTMLElement>>('stack');
    private lastOrder = '';

    ngAfterViewChecked(): void {
        const order = this.feedback.notifications().map(item => `${item.id}:${item.count}`).join(',');
        if (order === this.lastOrder) return;
        this.lastOrder = order;
        const element = this.stack()?.nativeElement;
        if (element) element.scrollTop = element.scrollHeight;
    }
}
