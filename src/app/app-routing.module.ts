import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewSelectorComponent } from './dashboard/view-selector/view-selector.component';
import { CategorySelectorComponent } from './dashboard/category-selector/category-selector.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
	{
		path: 'dashboard',
		component: DashboardComponent,
		children: [
			{
				path: 'view-selector',
				component: ViewSelectorComponent
			},
			{
				path: 'category-selector',
				component: CategorySelectorComponent
			}
		]
	},
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
