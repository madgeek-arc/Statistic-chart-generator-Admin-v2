import { TestBed } from '@angular/core/testing';

import { ChartProviderService } from './chart-provider.service';

describe('UrlProviderService', () => {
  let service: ChartProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
