import { platformBrowser } from "@angular/platform-browser";
import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
	if (window) {
		// eslint-disable-next-line @typescript-eslint/no-empty-function -- deliberate no-op to silence console.log in production
		window.console.log = function () { };
	}
}

platformBrowser().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
	.catch(err => console.error(err));
