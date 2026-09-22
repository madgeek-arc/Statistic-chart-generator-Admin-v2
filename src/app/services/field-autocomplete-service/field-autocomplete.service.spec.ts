import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AutocompleteResponse, FieldAutocompleteService } from './field-autocomplete.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

describe('FieldAutocompleteService', () => {
  let service: FieldAutocompleteService;
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(FieldAutocompleteService);
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);

    // MappingProfilesService's own constructor fires GET /schema/profiles as a side
    // effect of injecting it (directly, or via FieldAutocompleteService's dependency on
    // it) — flush it so it isn't left outstanding for httpMock.verify() below.
    httpMock.expectOne(urlProvider.serviceURL + '/schema/profiles').flush([]);
  });

  afterEach(() => httpMock.verify());

  it('fetches GET /schema/fields/{field}/{text} with no profile selected, matching the real shape', () => {
    let result: AutocompleteResponse | undefined;
    service.getAutocompleteFields('publication.year', '202').subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/schema/fields/publication.year/202');
    expect(req.request.method).toBe('GET');

    // Real response shape from services.openaire.eu/stats-tool, 22 Sep 2026.
    const fixture: AutocompleteResponse = { count: 13, values: ['202', '1202', '2020', '2021'] };
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('handles a count with no values key, meaning "too many matches, narrow down"', () => {
    let result: AutocompleteResponse | undefined;
    service.getAutocompleteFields('publication.year', null).subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/schema/fields/publication.year');
    req.flush({ count: 1244 });

    expect(result?.count).toBe(1244);
    expect(result?.values).toBeUndefined();
  });

  it('handles a null body for an empty response without throwing (regression for the earlier "throws on empty response" fix)', () => {
    let result: AutocompleteResponse | null | undefined;
    let errored = false;
    service.getAutocompleteFields('publication.year', 'zzz').subscribe({
      next: r => result = r,
      error: () => errored = true
    });

    const req = httpMock.expectOne(urlProvider.serviceURL + '/schema/fields/publication.year/zzz');
    req.flush(null);

    expect(errored).toBeFalse();
    expect(result).toBeNull();
  });
});
