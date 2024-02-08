import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, catchError, first, retry } from 'rxjs';
import { ChartProviderService, ISupportedMap, ISupportedMiscType, ISupportedPolar, ISupportedSpecialChartType } from 'src/app/services/chart-provider/chart-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';

@Component({
	selector: 'app-category-selector',
	templateUrl: './category-selector.component.html',
	styleUrls: ['./category-selector.component.less']
})
export class CategorySelectorComponent implements OnInit {

	supportedChartTypes: Array<ISupportedChart> = [];
	supportedPolarTypes: Array<ISupportedPolar> = [];
	supportedMaps: Array<ISupportedMap> = [];
	supportedSpecialisedDiagrams: Array<ISupportedSpecialChartType> = [];
	supportedMiscTypes: Array<ISupportedMiscType> = [];

	availableDiagrams: Array<ISupportedCategory> = [];

	hideChartFilter = (chart: ISupportedChart) => !chart.isHidden;


	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
		private chartProvider: ChartProviderService
	) { }

	ngOnInit(): void {
		this.chartProvider.getSupportedChartTypes().pipe(first()).subscribe(
			(data: Array<ISupportedChart>) => {
				this.supportedChartTypes = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedChartTypes:", error);
			},
			() => {
				this.supportedChartTypes.map((elem: ISupportedChart) => {
					this.availableDiagrams.push(elem);
				});
			}
		);

		this.chartProvider.getSupportedPolarTypes().pipe(first()).subscribe(
			(data: Array<ISupportedPolar>) => {
				this.supportedPolarTypes = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedPolarTypes.map((elem: ISupportedPolar) => {
					this.availableDiagrams.push(elem);
				});
			}
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

