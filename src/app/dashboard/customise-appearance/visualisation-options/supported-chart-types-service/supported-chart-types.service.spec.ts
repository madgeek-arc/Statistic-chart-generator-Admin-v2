import { TestBed, inject } from '@angular/core/testing';

import { SupportedChartTypesService } from './supported-chart-types.service';

describe('SupportedChartTypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SupportedChartTypesService]
    });
  });

  it('should be created', inject([SupportedChartTypesService], (service: SupportedChartTypesService) => {
    expect(service).toBeTruthy();
  }));
});
