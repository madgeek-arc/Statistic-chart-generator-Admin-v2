import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomiseAppearanceComponent } from './customise-appearance.component';

describe('CustomiseAppearanceComponent', () => {
  let component: CustomiseAppearanceComponent;
  let fixture: ComponentFixture<CustomiseAppearanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomiseAppearanceComponent]
    });
    fixture = TestBed.createComponent(CustomiseAppearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
