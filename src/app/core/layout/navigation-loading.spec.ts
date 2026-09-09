import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NavigationError, NavigationStart, provideRouter, Router} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {Subject} from 'rxjs';
import {AppComponent} from '../../app.component';
import {AppLayoutComponent} from './app-layout/app-layout.component';
import {NavigationLoadingService, skeletonLayout} from './navigation-loading.service';

@Component({template: '<input value="Unsaved draft">'})
class ExistingPage {}
@Component({template: 'Destination data'})
class DestinationPage {}

describe('navigation loading layout', () => {
    let guard: Subject<boolean>;
    beforeEach(() => {
        guard = new Subject<boolean>();
        TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([
            {path: '', component: AppLayoutComponent, children: [
                {path: 'home', component: ExistingPage},
                {path: 'banking', component: DestinationPage, canActivate: [() => guard]}
            ]}
        ])]});
    });

    it('shows a skeleton during validation, keeps the shell, and restores the same draft when cancelled', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const router = TestBed.inject(Router);
        await router.navigateByUrl('/home');
        fixture.detectChanges();
        const draft = fixture.nativeElement.querySelector('input');
        draft.value = 'Keep this draft';
        const navigation = router.navigateByUrl('/banking');
        await Promise.resolve();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).not.toBeNull();
        expect(draft.closest('[hidden]')).not.toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Destination data');
        guard.next(false);
        await navigation;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).toBeNull();
        expect(fixture.nativeElement.querySelector('input')).toBe(draft);
        expect(draft.value).toBe('Keep this draft');
        expect(draft.closest('[hidden]')).toBeNull();
    });

    it('covers initial deep-link validation without activating private content', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const navigation = TestBed.inject(Router).navigateByUrl('/banking');
        await Promise.resolve();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-header')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Destination data');
        guard.next(true);
        await navigation;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-ui-skeleton')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Destination data');
    });

    it('does not obscure query-only filter changes and ignores failures from older navigation', async () => {
        const service = TestBed.inject(NavigationLoadingService);
        const router = TestBed.inject(Router);
        await router.navigateByUrl('/home');
        await router.navigateByUrl('/home?period=year');
        expect(service.pending()).toBeNull();
        const events = router.events as Subject<any>;
        events.next(new NavigationStart(100, '/banking'));
        events.next(new NavigationStart(101, '/fuel'));
        events.next(new NavigationError(100, '/banking', new Error('Older failure')));
        expect(service.pending()?.layout).toBe('fuel');
        events.next(new NavigationError(101, '/fuel', new Error('Failed import')));
        expect(service.pending()).toBeNull();
    });

    it('selects proportions for dashboards, lists and editor deep links', () => {
        expect(skeletonLayout('/accounting?period=month')).toBe('accounting');
        expect(skeletonLayout('/fuel/')).toBe('fuel');
        expect(skeletonLayout('/fuel/refuels')).toBe('table');
        expect(skeletonLayout('/banking/history')).toBe('page');
        expect(skeletonLayout('/accounting/expenses?mode=add')).toBe('form');
        expect(skeletonLayout('/account')).toBe('form');
    });
});
