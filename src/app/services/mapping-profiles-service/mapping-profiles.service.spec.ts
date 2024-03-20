import { TestBed, inject } from '@angular/core/testing';

import { MappingProfilesService } from './mapping-profiles.service';

describe('MappingProfilesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MappingProfilesService]
    });
  });

  it('should be created', inject([MappingProfilesService], (service: MappingProfilesService) => {
    expect(service).toBeTruthy();
  }));
});
