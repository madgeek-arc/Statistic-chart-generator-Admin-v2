import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ViewSelectorComponent } from './dashboard/view-selector/view-selector.component';
import { CategorySelectorComponent } from './dashboard/category-selector/category-selector.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CardComponentComponent } from './dashboard/helper-components/card-component/card-component.component';
import { MaterialModule } from './material/material.module';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DiagramCardComponentComponent } from './dashboard/helper-components/diagram-card-component/diagram-card-component.component';
import { CapitalizePipe } from './dashboard/pipes/capitalize.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataseriesSelectorComponent } from './dashboard/dataseries-selector/dataseries-selector.component';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		HeaderComponent,
		FooterComponent,
		ViewSelectorComponent,
		CategorySelectorComponent,
		PageNotFoundComponent,
		CardComponentComponent,
		DiagramCardComponentComponent,
		DataseriesSelectorComponent,

		// Pipes
		CapitalizePipe,
	],
	imports: [
		BrowserModule,
		ReactiveFormsModule,
		FormsModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		MaterialModule,
		CommonModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
