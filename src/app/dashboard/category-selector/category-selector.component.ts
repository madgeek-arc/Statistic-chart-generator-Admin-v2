import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { first } from 'rxjs';
import { ChartProviderService, ISupportedMap, ISupportedMiscType, ISupportedPolar, ISupportedSpecialChartType } from 'src/app/services/chart-provider/chart-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';

@Component({
	selector: 'app-category-selector',
	templateUrl: './category-selector.component.html',
	styleUrls: ['./category-selector.component.less']
})
export class CategorySelectorComponent implements OnInit {

	@Output() showCategorySelection = new EventEmitter<string>;

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


		this.chartProvider.getSupportedMaps().pipe(first()).subscribe(
			(data: Array<ISupportedMap>) => {
				this.supportedMaps = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedMaps.map((elem: ISupportedMap) => {
					this.availableDiagrams.push(elem);
				});
			}
		);

		this.chartProvider.getSupportedSpecialChartTypes().pipe(first()).subscribe(
			(data: Array<ISupportedSpecialChartType>) => {
				this.supportedSpecialisedDiagrams = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedSpecialisedDiagrams.map((elem: ISupportedSpecialChartType) => {
					this.availableDiagrams.push(elem);
				});
			}
		);


		this.chartProvider.getSupportedMiscTypes().pipe(first()).subscribe(
			(data: Array<ISupportedMiscType>) => {
				this.supportedMiscTypes = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedMiscTypes.map((elem: ISupportedMiscType) => {
					this.availableDiagrams.push(elem);
				});
			}
		);


	}

	moveToNextStep(event: any): void {
		if (event.name) {
			this.showCategorySelection.emit(event.name)
		} else {
			this.showCategorySelection.emit("PlaceHolder")
		}
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

