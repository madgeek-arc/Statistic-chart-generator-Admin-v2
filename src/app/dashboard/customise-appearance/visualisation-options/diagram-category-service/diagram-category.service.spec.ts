import { TestBed } from '@angular/core/testing';

import { DiagramCategoryService } from './diagram-category.service';

describe('DiagramCategoryServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiagramCategoryService = TestBed.get(DiagramCategoryService);
    expect(service).toBeTruthy();
  });
});
