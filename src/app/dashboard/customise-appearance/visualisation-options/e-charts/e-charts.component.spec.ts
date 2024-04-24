import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EChartsComponent } from './e-charts.component';

describe('EChartsComponent', () => {
  let component: EChartsComponent;
  let fixture: ComponentFixture<EChartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EChartsComponent]
    });
    fixture = TestBed.createComponent(EChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
