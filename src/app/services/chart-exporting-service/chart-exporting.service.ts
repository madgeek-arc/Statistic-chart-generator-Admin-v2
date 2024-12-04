import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, distinctUntilChanged, first } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { ErrorHandlerService } from 'src/app/dashboard/customise-appearance/visualisation-options/error-handler-service/error-handler.service';
import {
  HighChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model";
import {
  GoogleChartsChart, GoogleChartsTable
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model";
import {
  HighMapsMap
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model";
import {
  EChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model";
import {
  RawChartDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model";
import {
  RawDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/description-rawData.model";

type PostTinyUrlCallback = (shortUrl: string) => void;

export class ShortenUrlResponse {
	constructor(shortUrl: string) { this.shortUrl = shortUrl; }
	public shortUrl: string;
}

@Injectable({
	providedIn: 'root'
})
export class ChartExportingService {

	// Chart Url
	private _chartUrl = new BehaviorSubject<string | null>(null);
	private _chartTinyUrl = new BehaviorSubject<string>(null as any);
	get chartTinyUrl$() { return this._chartTinyUrl.asObservable(); }
	// Chart Load Url
	private _loadingChartTinyUrl = new BehaviorSubject<boolean>(false);
	get loadingChartTinyUrl$() { return this._loadingChartTinyUrl.asObservable(); }

	// Table Url
	private _tableUrl = new BehaviorSubject<string>(null as any);
	private _tableTinyUrl = new BehaviorSubject<string>(null as any);
	get tableTinyUrl$() { return this._tableTinyUrl.asObservable(); }
	// Table Load Url
	private _loadingTableTinyUrl = new BehaviorSubject<boolean>(false);
	get loadingTableTinyUrl$() { return this._loadingTableTinyUrl.asObservable(); }

	// Raw Chart Data Url
	private _rawChartDataUrl = new BehaviorSubject<string>(null as any);
	private _rawChartDataTinyUrl = new BehaviorSubject<string>(null as any);
	get rawChartDataTinyUrl$() { return this._rawChartDataTinyUrl.asObservable(); }
	// Raw Chart Data Load Url
	private _loadingRawChartDataTinyUrl = new BehaviorSubject<boolean>(false);
	get loadingRawChartDataTinyUrl$() { return this._loadingRawChartDataTinyUrl.asObservable(); }

	// Raw Data Url
	private _rawDataUrl = new BehaviorSubject<string>(null as any);
	private _rawDataTinyUrl = new BehaviorSubject<string>(null as any);
	get rawDataTinyUrl$() { return this._rawDataTinyUrl.asObservable(); }
	// Raw Data Load Url
	private _loadingRawDataTinyUrl = new BehaviorSubject<boolean>(false);
	get loadingRawDataTinyUrl$() { return this._loadingRawDataTinyUrl.asObservable(); }

	constructor(private http: HttpClient, private errorHandler: ErrorHandlerService, private urlProvider: UrlProviderService) {

		// Chart Url Loader
		this._chartUrl.pipe(distinctUntilChanged()).subscribe({
      next: chartUrl => {
        this.handleStringURL(chartUrl, this._loadingChartTinyUrl, this._chartTinyUrl)
      },
      error: err =>  {
        this.errorHandler.handleError(err) // error path
      }
    });

		// Table Url Loader
		this._tableUrl.pipe(distinctUntilChanged()).subscribe(
			(tableUrl: string) => this.handleStringURL(tableUrl, this._loadingTableTinyUrl, this._tableTinyUrl), // success path
			error => this.errorHandler.handleError(error) // error path
		);

		// Raw Chart Data Url Loader
		this._rawChartDataUrl.pipe(distinctUntilChanged()).subscribe(
			(rawChartDataUrl: string) => this.handleStringURL(rawChartDataUrl, this._loadingRawChartDataTinyUrl, this._rawChartDataTinyUrl), // success path
			error => this.errorHandler.handleError(error) // error path
		);

		// Raw Data Url Loader
		this._rawDataUrl.pipe(distinctUntilChanged()).subscribe(
			(rawDataUrl: string) => this.handleStringURL(rawDataUrl, this._loadingRawDataTinyUrl, this._rawDataTinyUrl), // success path
			error => this.errorHandler.handleError(error) // error path
		);
	}

	private handleStringURL(stringURL: string | null, _loadingTinyUrl: BehaviorSubject<boolean>, _tinyUrl: BehaviorSubject<string>) {
    stringURL ? this.postTinyUrl(stringURL, _loadingTinyUrl, _tinyUrl) : _tinyUrl.next(null as any);
  }

	private postTinyUrl(chartUrl: string, loader: BehaviorSubject<boolean>, tinyUrlSubject: BehaviorSubject<string>) {

		loader.next(true);

		const postUrl = this.urlProvider.serviceURL + '/chart/shorten';

		const postHeaders = new HttpHeaders();
		postHeaders.append('Content-Type', 'application/json');

		this.http.post<ShortenUrlResponse>(postUrl,
			{ 'url': encodeURIComponent(chartUrl) },
			{ headers: postHeaders })
			.pipe(first(),
				catchError(
					err => {
						this.errorHandler.handleError(err);
						const unshortenedResponse = new ShortenUrlResponse(chartUrl);
						return of(unshortenedResponse);
					}))
			.subscribe(
				// success path
				(response: ShortenUrlResponse) => {
					tinyUrlSubject.next(response.shortUrl);
					console.log('tinyURLResponse ->', response.shortUrl);
				},
				// error path
				error => this.errorHandler.handleError(error)
				,
				// complete path
				() => loader.next(false)
			);
	}

	public changeChartUrl(chartObject: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null) {

		if (!chartObject) {
			this._chartUrl.next(null);
			return;
		}

		console.log("chartObject", chartObject);
		this._chartUrl.next(this.urlProvider.createChartURL(chartObject));
	}

	public changeTableUrl(tableObject: GoogleChartsTable | null) {

		if (!tableObject) {
			this._tableUrl.next(null as any)
			return;
		}

		this._tableUrl.next(this.urlProvider.createTableURL(tableObject));
	}

	public changeRawChartDataUrl(rawChartDataObject: RawChartDataModel | null) {

		if (!rawChartDataObject) {
			this._rawChartDataUrl.next(null as any)
			return;
		}

		this._rawChartDataUrl.next(this.urlProvider.createRawChartDataUrl(rawChartDataObject));
	}

	public changeRawDataUrl(rawDataObject: RawDataModel | null) {

		if (!rawDataObject) {
			this._rawDataUrl.next(null as any)
			return;
		}

		this._rawDataUrl.next(this.urlProvider.createRawDataUrl(rawDataObject));
	}
}
