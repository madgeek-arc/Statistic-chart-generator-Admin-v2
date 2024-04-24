import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighChartsComponent } from './high-charts.component';

describe('HighChartsComponent', () => {
  let component: HighChartsComponent;
  let fixture: ComponentFixture<HighChartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HighChartsComponent]
    });
    fixture = TestBed.createComponent(HighChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
