import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./fuel.component').then(m => m.FuelComponent),
        children: [
            {path: '', pathMatch: 'full', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)},
            {path: 'refuels', loadComponent: () => import('./refuel/refuel.component').then(m => m.RefuelComponent)},
            {path: 'cars', loadComponent: () => import('./car/car.component').then(m => m.CarComponent)},
        ]
    }
];
