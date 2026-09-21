import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{
		path: 'dashboard',
		loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
	},
	{ path: '**', component: PageNotFoundComponent }
];
