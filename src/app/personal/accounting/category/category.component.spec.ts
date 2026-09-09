import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CategoryComponent} from './category.component';
import {AccountingService} from '../../../shared/api/accounting.service';
import {of} from 'rxjs';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryComponent],
            providers: [{provide: AccountingService, useValue: {get_categories: () => of([])}}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
