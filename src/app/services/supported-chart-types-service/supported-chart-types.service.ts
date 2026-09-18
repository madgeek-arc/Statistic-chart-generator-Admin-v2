import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlProviderService } from 'src/app/services/url-provider-service/url-provider.service';
import { ErrorHandlerService } from "../error-handler-service/error-handler.service";

@Injectable({
  providedIn: 'root'
})
export class SupportedChartTypesService {

constructor(private http: HttpClient, private urlProvider: UrlProviderService, private errorHandler: ErrorHandlerService) {}

  getSupportedChartTypes(): Observable<ISupportedChart[]> {

    const supportedChartTypesUrl = this.urlProvider.serviceURL + '/chart/types';
    return this.http.get<ISupportedChart[]>(supportedChartTypesUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }

  getSupportedPolarTypes(): Observable<ISupportedPolar[]> {

    const supportedPolarTypesUrl = this.urlProvider.serviceURL + '/chart/polar/types';
    return this.http.get<ISupportedPolar[]>(supportedPolarTypesUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }

  getSupportedMaps(): Observable<ISupportedMap[]> {

    const supportedMapsUrl = this.urlProvider.serviceURL + '/chart/maps';
    return this.http.get<ISupportedMap[]>(supportedMapsUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }

  getSupportedSpecialChartTypes(): Observable<ISupportedSpecialChartType[]> {

    const supportedSpecialChartTypesUrl = this.urlProvider.serviceURL + '/chart/special';
    return this.http.get<ISupportedSpecialChartType[]>(supportedSpecialChartTypesUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }

  getSupportedMiscTypes(): Observable<ISupportedMiscType[]> {

    const supportedMiscTypesUrl = this.urlProvider.serviceURL + '/chart/misc';
    return this.http.get<ISupportedMiscType[]>(supportedMiscTypesUrl)
        .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.errorHandler.handleError) // then handle the error
        );
  }
}

export interface ISupportedCategory {
  type: string;
  supportedLibraries: string[];
  name?: string;
  diagramId?: number;
  description?: string;
  imageURL?: string;
  isPolar?: boolean;
  isHidden?: boolean;
}
export type ISupportedChart = ISupportedCategory;
export interface ISupportedPolar extends ISupportedCategory { isPolar: boolean;}
export interface ISupportedMap extends ISupportedCategory { name: string; }
export type ISupportedSpecialChartType = ISupportedCategory;
export type ISupportedMiscType = ISupportedCategory;

