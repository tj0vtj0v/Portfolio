import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';

import {HeaderComponent} from './header.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent],
            providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('keeps remembered period queries separate from the Workspace path', () => {
        fixture.componentRef.setInput('workspaceTarget', '/accounting?period=year#activity');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.view-switch a').getAttribute('href')).toBe('/accounting?period=year#activity');
        fixture.componentRef.setInput('workspaceTarget', '/banking');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.view-switch a').getAttribute('href')).toBe('/accounting');
    });
});
