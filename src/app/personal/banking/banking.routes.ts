import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./banking.component').then(m => m.BankingComponent),
        children: [
            {path: '', pathMatch: 'full', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)},
            {path: 'history', loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent)},
            {path: 'transactions', loadComponent: () => import('./transaction/transaction.component').then(m => m.TransactionComponent)},
        ]
    }
];
