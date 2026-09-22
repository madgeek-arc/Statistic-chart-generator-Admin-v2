import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DbSchemaService } from './db-schema.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { Profile } from '../mapping-profiles-service/mapping-profiles.service';

describe('DbSchemaService', () => {
  let service: DbSchemaService;
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DbSchemaService);
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);
  });

  afterEach(() => httpMock.verify());

  it('fetches GET /schema/{profile}/entities and returns the entity name list', () => {
    const profile: Profile = { name: 'openaire', description: '', usage: '', shareholders: [], complexity: 0 };
    let result: string[] | undefined;
    service.getAvailableEntities(profile).subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/schema/openaire/entities');
    expect(req.request.method).toBe('GET');

    // Real response shape from services.openaire.eu/stats-tool/schema/openaire/entities, 22 Sep 2026.
    const fixture = ['category', 'concept', 'context', 'country', 'dataset', 'datasource', 'organization', 'other', 'project', 'publication', 'result', 'software'];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('skips the HTTP call and returns an empty list for a null/undefined profile', () => {
    let result: string[] | undefined;
    service.getAvailableEntities(null).subscribe(r => result = r);

    expect(result).toEqual([]);
  });
});
