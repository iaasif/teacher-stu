import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];