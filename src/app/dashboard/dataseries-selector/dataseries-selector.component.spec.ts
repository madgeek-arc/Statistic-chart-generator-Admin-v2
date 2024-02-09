import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataseriesSelectorComponent } from './dataseries-selector.component';

describe('DataseriesSelectorComponent', () => {
  let component: DataseriesSelectorComponent;
  let fixture: ComponentFixture<DataseriesSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataseriesSelectorComponent]
    });
    fixture = TestBed.createComponent(DataseriesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
