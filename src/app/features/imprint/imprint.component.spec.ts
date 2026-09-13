import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ImprintComponent} from './imprint.component';

describe('ImprintComponent', () => {
    let component: ImprintComponent;
    let fixture: ComponentFixture<ImprintComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ImprintComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImprintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('shows the current provider details and straightforward legal sections', () => {
        const page: HTMLElement = fixture.nativeElement;

        expect(page.textContent).toContain('Robert-Koch-Weg 7');
        expect(page.textContent).toContain('35745 Herborn');
        expect(page.textContent).not.toContain('Elisabeth-Rothweiler');
        expect(page.textContent).not.toContain('§ 5 TMG');
        expect(page.textContent).toContain('§ 5 DDG');
        expect(page.textContent).toContain('personal website');
        expect(page.textContent).toContain('Email:');
        expect(page.textContent).toContain('Phone:');
        expect(page.querySelector('a[href="https://burdorf.dev"]')).toBeNull();
        expect(page.textContent).not.toContain('Raspberry Pi');
        expect(page.textContent).not.toContain('GitHub Actions');
        expect(page.textContent).not.toContain('On this page');
        expect(page.textContent).not.toContain('01 /');
        expect(page.querySelector('a[href="mailto:tjorven@burdorf.dev"]')).not.toBeNull();
    });
});
