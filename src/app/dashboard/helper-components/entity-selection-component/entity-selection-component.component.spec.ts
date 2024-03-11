import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySelectionComponentComponent } from './entity-selection-component.component';

describe('CardComponentComponent', () => {
  let component: EntitySelectionComponentComponent;
  let fixture: ComponentFixture<EntitySelectionComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntitySelectionComponentComponent]
    });
    fixture = TestBed.createComponent(EntitySelectionComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
