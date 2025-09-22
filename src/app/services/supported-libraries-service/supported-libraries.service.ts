import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlProviderService } from "../url-provider-service/url-provider.service";
import { ErrorHandlerService } from "../error-handler-service/error-handler.service";

@Injectable({
  providedIn: 'root'
})
export class SupportedLibrariesService {

  constructor(private http: HttpClient,
     private urlProvider: UrlProviderService, private errorHandler: ErrorHandlerService) {}

  getSupportedLibraries(): Observable<Array<string>> {

    const supportedLibrariesUrl = this.urlProvider.serviceURL + '/chart/libraries';
    return this.http.get<Array<string>>(supportedLibrariesUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
  );
  }

}
