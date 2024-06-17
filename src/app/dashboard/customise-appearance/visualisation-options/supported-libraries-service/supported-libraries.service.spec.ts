import { TestBed, inject } from '@angular/core/testing';

import { SupportedLibrariesService } from './supported-libraries.service';

describe('SupportedLibrariesServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SupportedLibrariesService]
    });
  });

  it('should be created', inject([SupportedLibrariesService], (service: SupportedLibrariesService) => {
    expect(service).toBeTruthy();
  }));
});
