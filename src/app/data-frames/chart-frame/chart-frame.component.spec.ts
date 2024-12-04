import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartFrameComponent } from './chart-frame.component';

describe('ChartFrameComponent', () => {
  let component: ChartFrameComponent;
  let fixture: ComponentFixture<ChartFrameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
