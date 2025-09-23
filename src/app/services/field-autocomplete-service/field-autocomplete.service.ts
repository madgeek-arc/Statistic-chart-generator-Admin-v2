import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { ErrorHandlerService } from "../error-handler-service/error-handler.service";
import { MappingProfilesService, Profile } from '../mapping-profiles-service/mapping-profiles.service';

export class AutocompleteResponse {
  count: number | null =  null;
  values: Array<string> = [];
}

@Injectable({
  providedIn: 'root'
})
export class FieldAutocompleteService {

  constructor(private http: HttpClient, private urlProvider: UrlProviderService,
     private errorHandler: ErrorHandlerService, private profileMappingService: MappingProfilesService) {}

  getAutocompleteFields(field: string, text: string): Observable<AutocompleteResponse> {

    const profile: Profile = this.profileMappingService.selectedProfile$.value;

    let autocompleteFieldTextUrl = this.urlProvider.serviceURL
    + '/schema/' + (profile === null ? '' : profile.name)
    + '/fields/' + field + (text === null ? '' : '/' + text);

    autocompleteFieldTextUrl = encodeURI(autocompleteFieldTextUrl);

    console.log('Calling: ' + autocompleteFieldTextUrl);
    return this.http.get<AutocompleteResponse>(autocompleteFieldTextUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }
}
