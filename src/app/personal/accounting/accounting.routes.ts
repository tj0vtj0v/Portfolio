import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./accounting.component').then(m => m.AccountingComponent),
        children: [
            {path: '', pathMatch: 'full', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)},
            {path: 'expenses', loadComponent: () => import('./expense/expense.component').then(m => m.ExpenseComponent)},
            {path: 'incomes', loadComponent: () => import('./income/income.component').then(m => m.IncomeComponent)},
            {path: 'transfers', loadComponent: () => import('./transfer/transfer.component').then(m => m.TransferComponent)},
            {path: 'accounts', loadComponent: () => import('./account/account.component').then(m => m.AccountComponent)},
            {path: 'categories', loadComponent: () => import('./category/category.component').then(m => m.CategoryComponent)},
        ]
    }
];
