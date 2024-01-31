import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, catchError, retry } from 'rxjs';
import { UrlProviderService } from 'src/app/services/url-provider.service';

@Component({
	selector: 'app-category-selector',
	templateUrl: './category-selector.component.html',
	styleUrls: ['./category-selector.component.less']
})
export class CategorySelectorComponent {


	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService
	) { }


	// Possibly put in service 
	getSupportedChartTypes(): Observable<Array<ISupportedChart>> {

		const supportedChartTypesUrl = this.urlProvider.serviceURL + '/chart/types';
		return this.http.get<Array<ISupportedChart>>(supportedChartTypesUrl)
			.pipe(
				retry(3), // retry a failed request up to 3 times
				// catchError(this.errorHandler.handleError) // then handle the error
			);
	}


}

export interface ISupportedCategory {
	type: string;
	supportedLibraries: Array<string>;
	name?: string;
	diagramId?: number;
	description?: string;
	imageURL?: string;
	isPolar?: boolean;
	isHidden?: boolean;
}
export interface ISupportedChart extends ISupportedCategory { }

