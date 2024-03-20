import { TestBed, inject } from '@angular/core/testing';

import { UrlProviderService } from './url-provider.service';

describe('UrlProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlProviderService]
    });
  });

  it('should be created', inject([UrlProviderService], (service: UrlProviderService) => {
    expect(service).toBeTruthy();
  }));
});
