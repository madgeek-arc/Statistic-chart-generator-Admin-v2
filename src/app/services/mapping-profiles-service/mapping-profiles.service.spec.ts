import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MappingProfilesService, Profile } from './mapping-profiles.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

describe('MappingProfilesService', () => {
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const service = TestBed.inject(MappingProfilesService);
    httpMock.expectOne(urlProvider.serviceURL + '/schema/profiles').flush([]);

    expect(service).toBeTruthy();
  });

  it('loads GET /schema/profiles into mappingProfiles$ on construction, matching the real shape', () => {
    const service = TestBed.inject(MappingProfilesService);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/schema/profiles');
    expect(req.request.method).toBe('GET');

    // Real response shape from services.openaire.eu/stats-tool/schema/profiles, 22 Sep 2026.
    const fixture: Profile[] = [
      { name: 'openaire', description: 'Contains all the OpenAIRE information space and is compatible with the view in www.openaire.eu', usage: 'Best used to create statistics for the entire information space', shareholders: ['All'], complexity: 0 },
      { name: 'monitor', description: 'monitor', usage: '...', shareholders: ['Monitors'], complexity: 0 }
    ];
    req.flush(fixture);

    expect(service.mappingProfiles$.value).toEqual(fixture);
  });
});
