import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { ChartLoadingService } from "./app/services/chart-loading-service/chart-loading.service";
import { DynamicTreeDatabase } from "./app/services/dynamic-tree-database/dynamic-tree-database.service";
import { DbSchemaService } from "./app/services/db-schema-service/db-schema.service";
import { SupportedChartTypesService } from "./app/services/supported-chart-types-service/supported-chart-types.service";
import { ChartExportingService } from "./app/services/chart-exporting-service/chart-exporting.service";
import { provideMarkdown, MARKED_OPTIONS } from "ngx-markdown";
import { markedOptionsFactory } from "./app/services/marked-option-factory/marked-options.factory";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app/app-routing.module";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { AppComponent } from "./app/app.component";

if (environment.production) {
	enableProdMode();
	if (window) {
		// eslint-disable-next-line @typescript-eslint/no-empty-function -- deliberate no-op to silence console.log in production
		window.console.log = function () { };
	}
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(BrowserModule, ReactiveFormsModule, FormsModule, 
        // BrowserAnimationsModule,
        AppRoutingModule, CommonModule, NgOptimizedImage),
        ChartLoadingService,
        DynamicTreeDatabase,
        DbSchemaService,
        SupportedChartTypesService,
        ChartExportingService,
        provideMarkdown({
            markedOptions: {
                provide: MARKED_OPTIONS,
                useFactory: markedOptionsFactory,
            },
        }),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
	.catch(err => console.error(err));
