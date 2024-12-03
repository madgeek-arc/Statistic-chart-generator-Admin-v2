import { TestBed } from '@angular/core/testing';

import { DynamicFormHandlingService } from './dynamic-form-handling.service';

describe('DynamicFormHandlingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicFormHandlingService = TestBed.get(DynamicFormHandlingService);
    expect(service).toBeTruthy();
  });
});
