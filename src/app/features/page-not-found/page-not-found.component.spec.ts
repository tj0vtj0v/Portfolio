import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageNotFoundComponent} from './page-not-found.component';
import {provideRouter} from '@angular/router';
import {UserService} from '../../shared/api/user.service';

describe('PageNotFoundComponent', () => {
    let component: PageNotFoundComponent;
    let fixture: ComponentFixture<PageNotFoundComponent>;
    const userService = {isLoggedIn: jasmine.createSpy()};

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageNotFoundComponent],
            providers: [provideRouter([]), {provide: UserService, useValue: userService}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PageNotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('offers the guarded Workspace destination to signed-in and signed-out users', () => {
        userService.isLoggedIn.and.returnValue(false);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('a[href="/accounting"]')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('a[href="/home"]')).toBeFalsy();
        userService.isLoggedIn.and.returnValue(true);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('a[href="/accounting"]')).toBeTruthy();
    });
});
