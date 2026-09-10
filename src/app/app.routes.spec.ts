import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {routes} from './app.routes';
import {AuthService} from './core/auth/auth.service';
import {ChartCardComponent} from './shared/charts/chart-card.component';
import {NEVER} from 'rxjs';

describe('Lazy feature navigation', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting(),
            {provide: AuthService, useValue: {ensureSession: () => Promise.resolve(true), isLoggedIn: () => true, logout: () => undefined, sessionEnded$: NEVER}}]});
        TestBed.overrideComponent(ChartCardComponent, {set: {template: '', imports: [], providers: []}});
    });

    it('opens child URLs directly and marks only the selected sidebar link active', async () => {
        const harness = await RouterTestingHarness.create();
        const backend = TestBed.inject(HttpTestingController);
        for (const url of ['/accounting/expenses', '/accounting/incomes', '/fuel/cars']) {
            await harness.navigateByUrl(url);
            backend.match(() => true).forEach(request => request.flush([]));
            harness.detectChanges();
            expect(TestBed.inject(Router).url).toBe(url);
            const links = harness.routeNativeElement!.querySelectorAll('.project-nav a.active');
            expect(links.length).toBe(1);
            expect(links[0].getAttribute('href')).toBe(url);
            expect(links[0].getAttribute('aria-current')).toBe('page');
        }
        backend.verify();
    });

    it('keeps the dashboard at the feature root', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/accounting');
        const backend = TestBed.inject(HttpTestingController);
        backend.match(() => true).forEach(request => request.flush([]));
        harness.detectChanges();
        expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toBe('Accounting');
        expect(harness.routeNativeElement!.querySelector('.project-nav a.active')!.textContent).toBe('Overview');
        backend.verify();
    });

    it('derives shell navigation from route metadata and remembers valid destinations', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/fuel/cars');
        TestBed.inject(HttpTestingController).match(() => true).forEach(request => request.flush([]));
        harness.detectChanges();
        const switches = harness.routeNativeElement!.querySelectorAll('.view-switch a');
        expect(switches.length).toBe(2);
        expect(switches[1].getAttribute('href')).toBe('/fuel/cars');
        expect(switches[1].getAttribute('aria-current')).toBe('page');
        const projectSelect = harness.routeNativeElement!.querySelector('select[aria-label="Workspace project"]') as HTMLSelectElement;
        expect(projectSelect.value).toBe('fuel');
        expect(harness.routeNativeElement!.querySelectorAll('.project-nav a.active').length).toBe(1);
        TestBed.inject(HttpTestingController).verify();
    });

    it('removes unavailable projects and the archived preview from active routes', async () => {
        const harness = await RouterTestingHarness.create();
        for (const url of ['/banking', '/banking/transactions', '/proximity', '/design-preview', '/ui-kit']) {
            await harness.navigateByUrl(url);
            harness.detectChanges();
            expect(harness.routeNativeElement!.textContent).toContain('Page not found');
            expect(harness.routeNativeElement!.querySelector('app-dashboard, ag-grid-angular, .preview')).toBeNull();
        }
        TestBed.inject(HttpTestingController).expectNone(() => true);
    });

    it('opens portfolio pages anonymously without requesting private data, while guarding Workspace', async () => {
        const auth = TestBed.inject(AuthService);
        spyOn(auth, 'ensureSession').and.resolveTo(false);
        spyOn(auth, 'isLoggedIn').and.returnValue(false);
        const harness = await RouterTestingHarness.create();
        for (const url of ['/', '/home', '/about', '/projects', '/contact']) {
            await harness.navigateByUrl(url);
            harness.detectChanges();
            expect(TestBed.inject(Router).url).toBe(url === '/' ? '/home' : url);
            expect(harness.routeNativeElement!.querySelectorAll('h1').length).toBe(1);
            expect(harness.routeNativeElement!.querySelector('.project-sidebar')).toBeNull();
            expect(harness.routeNativeElement!.querySelector('.portfolio-nav a.active')!.getAttribute('href')).toBe(url === '/' ? '/home' : url);
        }
        TestBed.inject(HttpTestingController).expectNone(() => true);
        expect(auth.ensureSession).not.toHaveBeenCalled();
        await harness.navigateByUrl('/accounting');
        expect(TestBed.inject(Router).url).toContain('/login?returnUrl=%2Faccounting');
    });

    it('remembers the public project section when moving between site areas', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/projects#mapping');
        await harness.navigateByUrl('/fuel/cars');
        TestBed.inject(HttpTestingController).match(() => true).forEach(request => request.flush([]));
        harness.detectChanges();
        const portfolioLink = harness.routeNativeElement!.querySelector('.view-switch a')!;
        expect(portfolioLink.getAttribute('href')).toBe('/projects#mapping');
        (portfolioLink as HTMLAnchorElement).click();
        await harness.fixture.whenStable();
        expect(TestBed.inject(Router).url).toBe('/projects#mapping');
        TestBed.inject(HttpTestingController).verify();
    });
});
