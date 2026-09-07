import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, Router} from '@angular/router';
import {By} from '@angular/platform-browser';
import {AuthService} from './core/auth/auth.service';
import {AppComponent} from './app.component';

@Component({template: 'Sensitive financial data'})
class PrivatePage {
    destroyed = false;
    ngOnDestroy() { this.destroyed = true; }
}
@Component({template: 'Public home'})
class HomePage {}

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([
                {path: 'accounting/expenses', component: PrivatePage},
                {path: 'home', component: HomePage}
            ])]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('destroys private content immediately on logout, before navigating away', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const router = TestBed.inject(Router);
        await router.navigateByUrl('/accounting/expenses');
        fixture.detectChanges();
        const page = fixture.debugElement.query(By.directive(PrivatePage)).componentInstance as PrivatePage;
        expect(fixture.nativeElement.textContent).toContain('Sensitive financial data');
        TestBed.inject(AuthService).logout();
        expect(page.destroyed).toBeTrue();
        expect(fixture.nativeElement.textContent).not.toContain('Sensitive financial data');
        await router.navigateByUrl('/home');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Public home');
        await router.navigateByUrl('/accounting/expenses');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.directive(PrivatePage)).componentInstance).not.toBe(page);
    });
});
