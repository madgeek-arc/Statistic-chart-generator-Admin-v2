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
import { EntitySelectionComponentComponent } from './dashboard/helper-components/entity-selection-component/entity-selection-component.component';
import { ChartLoadingService } from './services/chart-loading-service/chart-loading.service';
import { SelectAttributeComponent } from './dashboard/helper-components/select-attribute/select-attribute.component';
import { DynamicTreeDatabase } from './services/dynamic-tree-database/dynamic-tree-database.service';
import { DbSchemaService } from './services/db-schema-service/db-schema.service';
import { CustomiseAppearanceComponent } from './dashboard/customise-appearance/customise-appearance.component';
import { HighChartsComponent } from './dashboard/customise-appearance/visualisation-options/high-charts/high-charts.component';
import { GoogleChartsComponent } from './dashboard/customise-appearance/visualisation-options/google-charts/google-charts.component';
import { EChartsComponent } from './dashboard/customise-appearance/visualisation-options/e-charts/e-charts.component';
import { SupportedChartTypesService } from './dashboard/customise-appearance/visualisation-options/supported-chart-types-service/supported-chart-types.service';
import { ChartExportingService } from './services/chart-exporting-service/chart-exporting.service';
import { FilterOperatorsPipe } from './dashboard/pipes/filter-operators.pipe';
import { FrameModule } from './data-frames/frame.module';

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
		EntitySelectionComponentComponent,
		SelectAttributeComponent,
		CustomiseAppearanceComponent,

		// Pipes
		CapitalizePipe,
		FilterOperatorsPipe,
		HighChartsComponent,
		GoogleChartsComponent,
		EChartsComponent,
	],
	imports: [
		BrowserModule,
		ReactiveFormsModule,
		FormsModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		MaterialModule,
		CommonModule,
		FrameModule
	],
	providers: [
		ChartLoadingService,
		DynamicTreeDatabase,
		DbSchemaService,
		SupportedChartTypesService,
		ChartExportingService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
