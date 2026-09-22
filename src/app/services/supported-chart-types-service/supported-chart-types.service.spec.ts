import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ISupportedChart, ISupportedMap, SupportedChartTypesService } from './supported-chart-types.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

// Fixtures below are the real response shapes from services.openaire.eu/stats-tool,
// captured 22 Sep 2026, one representative entry per endpoint.

describe('SupportedChartTypesService', () => {
  let service: SupportedChartTypesService;
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SupportedChartTypesService);
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);
  });

  afterEach(() => httpMock.verify());

  it('fetches GET /chart/types', () => {
    let result: ISupportedChart[] | undefined;
    service.getSupportedChartTypes().subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/types');
    expect(req.request.method).toBe('GET');

    const fixture: ISupportedChart[] = [
      { name: 'column', diagramId: 0, description: 'Column Diagram', imageURL: 'images/imagePlaceholder.svg', isPolar: false, isHidden: false, supportedLibraries: ['HighCharts', 'GoogleCharts', 'eCharts'], type: 'column' },
      { name: 'dependencywheel', diagramId: 6, description: 'Dependency Wheel Diagram', imageURL: 'images/imagePlaceholder.svg', isPolar: false, isHidden: true, supportedLibraries: ['HighCharts', 'eCharts'], type: 'dependencywheel' }
    ];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('fetches GET /chart/polar/types', () => {
    let result: ISupportedChart[] | undefined;
    service.getSupportedPolarTypes().subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/polar/types');

    const fixture: ISupportedChart[] = [
      { name: 'area', diagramId: 8, description: 'Polar Area Diagram', imageURL: 'chart-type-svgs/polar-area.svg', isPolar: true, isHidden: false, supportedLibraries: ['HighCharts', 'GoogleCharts', 'eCharts'], type: 'area' }
    ];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('fetches GET /chart/maps, where every entry needs a real map name for the HighMaps chart.map lookup', () => {
    let result: ISupportedMap[] | undefined;
    service.getSupportedMaps().subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/maps');

    const fixture: ISupportedMap[] = [
      { name: 'custom/world-robinson-highres', diagramId: 12, description: 'World Map', imageURL: 'chart-type-svgs/map-world.svg', isPolar: false, isHidden: false, supportedLibraries: ['HighMaps'], type: 'world' }
    ];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('fetches GET /chart/special', () => {
    let result: ISupportedChart[] | undefined;
    service.getSupportedSpecialChartTypes().subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/special');

    const fixture: ISupportedChart[] = [
      { name: 'combo', diagramId: 13, description: 'Combination Diagram', imageURL: 'chart-type-svgs/special-combo.svg', isPolar: false, isHidden: false, supportedLibraries: ['HighCharts', 'GoogleCharts', 'eCharts'], type: 'combo' }
    ];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });

  it('fetches GET /chart/misc', () => {
    let result: ISupportedChart[] | undefined;
    service.getSupportedMiscTypes().subscribe(r => result = r);

    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/misc');

    const fixture: ISupportedChart[] = [
      { name: 'numbers', diagramId: 14, description: 'Numbers', imageURL: 'chart-type-svgs/other-numbers.svg', isPolar: false, isHidden: false, supportedLibraries: ['HighCharts', 'GoogleCharts', 'eCharts'], type: 'numbers' }
    ];
    req.flush(fixture);

    expect(result).toEqual(fixture);
  });
});
