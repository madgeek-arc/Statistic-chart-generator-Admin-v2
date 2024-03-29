import { TestBed } from '@angular/core/testing';

import { ChartLoadingService } from './chart-loading.service';

describe('ChartLoadingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChartLoadingService = TestBed.get(ChartLoadingService);
    expect(service).toBeTruthy();
  });
});
