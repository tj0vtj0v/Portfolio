import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import {provideRouter} from '@angular/router';
import {BankingService} from '../../../shared/api/banking.service';
import {of} from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), {provide: BankingService, useValue: {get_history: () => of([]), get_transactions: () => of([])}}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carries balance into the boundary and does not mutate history on repeated filtering', () => {
    const dashboard = component as any;
    dashboard.histories = [
      {date: '2026-02-02', amount: 20, account: {name: 'Main'}},
      {date: '2026-01-31', amount: 10, account: {name: 'Main'}}
    ];
    const range = {period: 'custom', from: '2026-02-01', to: '2026-02-02', observedTo: '2026-02-02'};
    component.update(range as any);
    component.update(range as any);
    expect(dashboard.histories.map((entry: any) => entry.date)).toEqual(['2026-02-02', '2026-01-31']);
    expect(dashboard.balance_chart.series[0].data).toEqual([['2026-02-01', 10], ['2026-02-02', 20]]);
  });
});
