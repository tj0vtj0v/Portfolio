import {Injectable, OnDestroy, signal} from '@angular/core';

export type FeedbackKind = 'info' | 'pending' | 'success' | 'warning' | 'error';

export interface Notification {
    id: number;
    message: string;
    kind: FeedbackKind;
    count: number;
    leaving: boolean;
}

@Injectable({providedIn: 'root'})
export class NotificationService implements OnDestroy {
    private readonly items = signal<Notification[]>([]);
    readonly notifications = this.items.asReadonly();
    private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
    private readonly pendingSources = new Map<object, number>();
    private nextId = 0;
    private generation = 0;

    /** Defer publication so feedback from view initialization is safe in dev mode. */
    show(message: string, kind: FeedbackKind = 'info', source?: object): void {
        if (!message.trim()) return;
        const generation = this.generation;
        queueMicrotask(() => {
            if (generation !== this.generation) return;
            const existing = this.items().find(item => item.message === message && item.kind === kind);
            const item: Notification = existing
                ? {...existing, count: existing.count + 1, leaving: false}
                : {id: ++this.nextId, message, kind, count: 1, leaving: false};
            this.cancelTimer(item.id);
            this.items.update(items => [...items.filter(entry => entry.id !== item.id), item]);
            if (source && kind === 'pending') this.pendingSources.set(source, item.id);
            this.timers.set(item.id, setTimeout(() => this.dismiss(item.id), 10_000));
        });
    }

    /** A completed/cancelled operation must not leave a stale Saving banner. */
    release(source: object): void {
        queueMicrotask(() => {
            const id = this.pendingSources.get(source);
            this.pendingSources.delete(source);
            if (id !== undefined && ![...this.pendingSources.values()].includes(id)) this.dismiss(id);
        });
    }

    dismiss(id: number): void {
        const item = this.items().find(entry => entry.id === id);
        if (!item || item.leaving) return;
        this.cancelTimer(id);
        this.items.update(items => items.map(entry => entry.id === id ? {...entry, leaving: true} : entry));
        this.timers.set(id, setTimeout(() => {
            this.items.update(items => items.filter(entry => entry.id !== id));
            this.timers.delete(id);
            for (const [source, pendingId] of this.pendingSources) {
                if (pendingId === id) this.pendingSources.delete(source);
            }
        }, 1_000));
    }

    clear(): void {
        this.generation++;
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
        this.pendingSources.clear();
        this.items.set([]);
    }

    ngOnDestroy(): void { this.clear(); }

    private cancelTimer(id: number): void {
        clearTimeout(this.timers.get(id));
        this.timers.delete(id);
    }
}
