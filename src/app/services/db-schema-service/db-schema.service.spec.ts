import { TestBed, inject } from '@angular/core/testing';

import { DbSchemaService } from './db-schema.service';

describe('DbSchemaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbSchemaService]
    });
  });

  it('should be created', inject([DbSchemaService], (service: DbSchemaService) => {
    expect(service).toBeTruthy();
  }));
});
