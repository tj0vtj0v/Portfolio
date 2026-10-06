import {fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {NotificationService} from './notification.service';
import {FeedbackMessage} from './feedback-message';
import {UiFeedbackComponent} from './ui-feedback.component';
import {NotificationStackComponent} from './notification-stack.component';

describe('Notifications', () => {
    let service: NotificationService;
    beforeEach(() => { service = TestBed.inject(NotificationService); });
    afterEach(() => service.clear());

    it('places newest last and merges only matching text AND status, restarting its lifetime', fakeAsync(() => {
        service.show('Saved', 'success');
        flushMicrotasks();
        tick(9_000);
        service.show('Offline', 'error');
        service.show('Saved', 'info');
        service.show('Saved', 'success');
        flushMicrotasks();
        expect(service.notifications().map(item => [item.message, item.kind, item.count])).toEqual([
            ['Offline', 'error', 1], ['Saved', 'info', 1], ['Saved', 'success', 2]
        ]);
        tick(9_999);
        expect(service.notifications().every(item => !item.leaving)).toBeTrue();
        tick(1);
        expect(service.notifications().every(item => item.leaving)).toBeTrue();
        tick(999);
        expect(service.notifications().length).toBe(3);
        tick(1);
        expect(service.notifications()).toEqual([]);
    }));

    it('revives a repeated message during its fade without the old timer removing it', fakeAsync(() => {
        service.show('Retry', 'warning');
        tick(10_500);
        expect(service.notifications()[0].leaving).toBeTrue();
        service.show('Retry', 'warning');
        flushMicrotasks();
        tick(500);
        expect(service.notifications()[0].count).toBe(2);
        expect(service.notifications()[0].leaving).toBeFalse();
        service.clear();
    }));

    it('publishes identical form failures on each attempt, ignoring empty resets', fakeAsync(() => {
        const state = TestBed.runInInjectionContext(() => new FeedbackMessage('error'));
        state.value = 'Name required';
        state.value = 'Name required';
        state.value = '';
        flushMicrotasks();
        expect(state.value).toBe('');
        expect(service.notifications()[0].count).toBe(2);
        service.clear();
    }));

    it('keeps shared pending feedback until all sources finish', fakeAsync(() => {
        const first = {};
        const second = {};
        service.show('Saving', 'pending', first);
        service.show('Saving', 'pending', second);
        service.release(first);
        flushMicrotasks();
        expect(service.notifications()[0].leaving).toBeFalse();
        service.release(second);
        flushMicrotasks();
        expect(service.notifications()[0].leaving).toBeTrue();
        tick(1_000);
        expect(service.notifications()).toEqual([]);
    }));

    it('cancels queued publications and timers when the session clears', fakeAsync(() => {
        service.show('Private detail', 'error');
        flushMicrotasks();
        service.show('Queued detail', 'error');
        service.clear();
        tick(11_000);
        expect(service.notifications()).toEqual([]);
    }));

    it('publishes template feedback once, preserves terminal messages on navigation and releases pending ones', fakeAsync(() => {
        const fixture = TestBed.createComponent(UiFeedbackComponent);
        fixture.componentRef.setInput('message', 'Loading');
        fixture.componentRef.setInput('kind', 'pending');
        fixture.detectChanges();
        fixture.detectChanges();
        flushMicrotasks();
        expect(service.notifications()[0].count).toBe(1);
        fixture.componentRef.setInput('message', 'Loaded');
        fixture.componentRef.setInput('kind', 'success');
        fixture.detectChanges();
        fixture.destroy();
        flushMicrotasks();
        expect(service.notifications().map(item => [item.kind, item.leaving])).toEqual([
            ['pending', true], ['success', false]
        ]);
        service.clear();
    }));

    it('renders escaped messages, accessible status roles and counters, and allows dismissal', fakeAsync(() => {
        const fixture = TestBed.createComponent(NotificationStackComponent);
        fixture.detectChanges();
        service.show('<img src=x onerror=alert(1)>', 'error');
        service.show('Saved', 'success');
        service.show('Saved', 'success');
        flushMicrotasks();
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector('img')).toBeNull();
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('<img');
        expect(host.querySelector('[role="status"]')?.textContent).toContain('Saved');
        expect([...host.querySelectorAll('.notification-count')].map(node => node.textContent)).toEqual(['(2x)']);
        host.querySelector<HTMLButtonElement>('button')!.click();
        tick(1_000);
        fixture.detectChanges();
        expect(host.querySelector('[role="alert"]')).toBeNull();
        expect(host.querySelector('[role="status"]')).not.toBeNull();
        fixture.destroy();
        service.clear();
    }));

    it('overlays page content and keeps banner height unchanged when the repeat pill appears', fakeAsync(() => {
        const pageContent = document.createElement('div');
        pageContent.textContent = 'Page content stays in place';
        document.body.appendChild(pageContent);
        const fixture = TestBed.createComponent(NotificationStackComponent);
        fixture.detectChanges();
        const position = pageContent.getBoundingClientRect().toJSON();
        service.show('Saved', 'success');
        flushMicrotasks();
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        const banner = host.querySelector<HTMLElement>('.notification')!;
        const height = banner.offsetHeight;
        expect(getComputedStyle(host).position).toBe('fixed');
        expect(host.querySelector('.notification-count')).toBeNull();
        service.show('Saved', 'success');
        flushMicrotasks();
        fixture.detectChanges();
        expect(banner.offsetHeight).toBe(height);
        expect(getComputedStyle(host.querySelector('.notification-count')!).position).toBe('absolute');
        expect(pageContent.getBoundingClientRect().toJSON()).toEqual(position);
        service.dismiss(service.notifications()[0].id);
        tick(1_000);
        fixture.detectChanges();
        expect(pageContent.getBoundingClientRect().toJSON()).toEqual(position);
        pageContent.remove();
        fixture.destroy();
    }));
});
