import { bootstrapApplication } from "@angular/platform-browser";
import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMarkdown, MARKED_OPTIONS } from "ngx-markdown";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

import { environment } from './environments/environment';
import { markedOptionsFactory } from "./app/services/marked-option-factory/marked-options.factory";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

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
        provideRouter(routes),
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
