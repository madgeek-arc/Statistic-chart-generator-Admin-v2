import { TestBed, inject } from '@angular/core/testing';

import { ChartExportingService } from './chart-exporting.service';

describe('ChartExportingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartExportingService]
    });
  });

  it('should be created', inject([ChartExportingService], (service: ChartExportingService) => {
    expect(service).toBeTruthy();
  }));
});
