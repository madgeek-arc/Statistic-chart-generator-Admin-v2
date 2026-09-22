import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ChartExportingService, ShortenUrlResponse } from './chart-exporting.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { HighChartsChart } from '../supported-libraries-service/models/chart-description-HighCharts.model';

// The app has no literal POST /chart call — the chart-rendering URL is a GET loaded
// directly by the browser as an iframe src, never parsed by Angular code. /chart/shorten
// is the real POST the app makes and depends on the response shape of, so it stands in
// for that item.

describe('ChartExportingService', () => {
  let service: ChartExportingService;
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ChartExportingService);
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('POSTs the chart URL to /chart/shorten and exposes the returned short URL', () => {
    const chart = new HighChartsChart('column', false);
    service.changeChartUrl(chart);

    const expectedChartUrl = urlProvider.createChartURL(chart);
    const req = httpMock.expectOne(urlProvider.serviceURL + '/chart/shorten');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url: encodeURIComponent(expectedChartUrl) });

    // Real response shape: ShortenUrlResponse { shortUrl: string }
    const fixture: ShortenUrlResponse = { shortUrl: 'https://tinyurl.com/abc123' } as ShortenUrlResponse;
    req.flush(fixture);

    let tinyUrl: string | null | undefined;
    service.chartTinyUrl$.subscribe(u => tinyUrl = u);
    expect(tinyUrl).toBe(fixture.shortUrl);
  });
});
