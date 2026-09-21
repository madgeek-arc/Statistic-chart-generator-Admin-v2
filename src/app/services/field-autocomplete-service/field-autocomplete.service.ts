import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { ErrorHandlerService } from "../error-handler-service/error-handler.service";
import { MappingProfilesService, Profile } from '../mapping-profiles-service/mapping-profiles.service';

export class AutocompleteResponse {
  count: number | null =  null;
  // null when the field has more distinct values than the server will inline
  // (the caller should prompt the user to type a narrowing term)
  values: string[] | null = [];
}

@Injectable({
  providedIn: 'root'
})
export class FieldAutocompleteService {
  private http = inject(HttpClient);
  private urlProvider = inject(UrlProviderService);
  private errorHandler = inject(ErrorHandlerService);
  private profileMappingService = inject(MappingProfilesService);

  getAutocompleteFields(field: string, text: string | null): Observable<AutocompleteResponse> {

    const profile: Profile = this.profileMappingService.selectedProfile$.value;

    let autocompleteFieldTextUrl = this.urlProvider.serviceURL
      + '/schema/' + (profile === null ? '' : (profile.name + '/')) + 'fields/' + field + (text === null ? '' : '/' + text);

    autocompleteFieldTextUrl = encodeURI(autocompleteFieldTextUrl);

    return this.http.get<AutocompleteResponse>(autocompleteFieldTextUrl)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.errorHandler.handleError) // then handle the error
    );
  }
}
