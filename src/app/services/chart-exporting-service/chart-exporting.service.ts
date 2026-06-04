import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, distinctUntilChanged, first } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { ErrorHandlerService } from "../error-handler-service/error-handler.service";
import { HighChartsChart } from "../supported-libraries-service/models/chart-description-HighCharts.model";
import {
  GoogleChartsChart,
  GoogleChartsTable
} from "../supported-libraries-service/models/chart-description-GoogleCharts.model";
import { HighMapsMap } from "../supported-libraries-service/models/chart-description-HighMaps.model";
import { EChartsChart } from "../supported-libraries-service/models/chart-description-eCharts.model";
import { RawChartDataModel } from "../supported-libraries-service/models/chart-description-rawChartData.model";
import { RawDataModel } from "../supported-libraries-service/models/description-rawData.model";

type PostTinyUrlCallback = (shortUrl: string) => void;

export class ShortenUrlResponse {
	constructor(shortUrl: string) { this.shortUrl = shortUrl; }
	public shortUrl: string;
}

interface UrlState {
  url$: Observable<string | null>;
  tinyUrl$: Observable<string | null>;
  loadingTinyUrl$: Observable<boolean>;

  setUrl(url: string | null): void;
  setTinyUrl(url: string | null): void;
  setLoading(isLoading: boolean): void;

  clear(): void;
}

@Injectable({
	providedIn: 'root'
})
export class ChartExportingService {

  private readonly chartState = this.createUrlState();
  private readonly tableState = this.createUrlState();
  private readonly rawChartDataState = this.createUrlState();
  private readonly rawDataState = this.createUrlState();

  get chartUrl$() { return this.chartState.url$; }
  get chartTinyUrl$() { return this.chartState.tinyUrl$; }
  get loadingChartTinyUrl$() { return this.chartState.loadingTinyUrl$; }

  get tableUrl$() { return this.tableState.url$; }
  get tableTinyUrl$() { return this.tableState.tinyUrl$; }
  get loadingTableTinyUrl$() { return this.tableState.loadingTinyUrl$; }

  get rawChartDataUrl$() { return this.rawChartDataState.url$; }
  get rawChartDataTinyUrl$() { return this.rawChartDataState.tinyUrl$; }
  get loadingRawChartDataTinyUrl$() { return this.rawChartDataState.loadingTinyUrl$; }

  get rawDataUrl$() { return this.rawDataState.url$; }
  get rawDataTinyUrl$() { return this.rawDataState.tinyUrl$; }
  get loadingRawDataTinyUrl$() { return this.rawDataState.loadingTinyUrl$; }

	constructor(private http: HttpClient, private errorHandler: ErrorHandlerService, private urlProvider: UrlProviderService) {
    // Update Tiny Urls when Urls change
    [this.chartState, this.tableState, this.rawChartDataState, this.rawDataState].forEach(state => {
      state.url$.pipe(distinctUntilChanged()).subscribe({
        next: url => this.handleStringURL(url, state),
        error: err => this.errorHandler.handleError(err)
      });
    });
	}

  private createUrlState(): UrlState {
    const urlSubject = new BehaviorSubject<string | null>(null);
    const tinyUrlSubject = new BehaviorSubject<string | null>(null);
    const loadingSubject = new BehaviorSubject<boolean>(false);

    return {
      url$: urlSubject.asObservable(),
      tinyUrl$: tinyUrlSubject.asObservable(),
      loadingTinyUrl$: loadingSubject.asObservable(),

      setUrl: (url: string | null) => urlSubject.next(url),
      setTinyUrl: (url: string | null) => tinyUrlSubject.next(url),
      setLoading: (isLoading: boolean) => loadingSubject.next(isLoading),

      clear: () => {
        urlSubject.next(null);
        tinyUrlSubject.next(null);
        loadingSubject.next(false);
      }
    };
  }

	private handleStringURL(stringURL: string | null, urlState: UrlState) {
    stringURL ? this.postTinyUrl(stringURL, urlState) : urlState.setTinyUrl(null);
  }

	private postTinyUrl(chartUrl: string, state: UrlState) {

    state.setLoading(true);

		const postUrl = this.urlProvider.serviceURL + '/chart/shorten';

		// const postHeaders = new HttpHeaders();
		// postHeaders.append('Content-Type', 'application/json');

    this.http.post<ShortenUrlResponse>(postUrl, { url: encodeURIComponent(chartUrl) })
      .pipe(
        first(),
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(new ShortenUrlResponse(chartUrl));
        })
      )
      .subscribe({
        next: response => {
          state.setTinyUrl(response.shortUrl);
        },
        error: err => this.errorHandler.handleError(err),
        complete: () => state.setLoading(false)
      });
	}

  public changeChartUrl(chartObject: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null): void {

    this.updateStateUrl(this.chartState, chartObject ? this.urlProvider.createChartURL(chartObject) : null);
  }

  public changeTableUrl(tableObject: GoogleChartsTable | null): void {

    this.updateStateUrl(this.tableState, tableObject ? this.urlProvider.createTableURL(tableObject) : null);
  }

  public changeRawChartDataUrl(rawChartDataObject: RawChartDataModel | null): void {

    this.updateStateUrl(this.rawChartDataState, rawChartDataObject ? this.urlProvider.createRawChartDataUrl(rawChartDataObject) : null);
  }

  public changeRawDataUrl(rawDataObject: RawDataModel | null): void {

    this.updateStateUrl(this.rawDataState, rawDataObject ? this.urlProvider.createRawDataUrl(rawDataObject) : null);
  }

  private updateStateUrl(state: UrlState, url: string | null): void {
    state.setUrl(url);
  }

  public clearChartUrls(): void {
    this.chartState.clear();
    this.tableState.clear();
    this.rawChartDataState.clear();
    this.rawDataState.clear();
  }
}
