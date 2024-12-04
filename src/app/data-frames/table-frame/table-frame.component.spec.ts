import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableFrameComponent } from './table-frame.component';

describe('ChartDataPresentationTableComponent', () => {
  let component: TableFrameComponent;
  let fixture: ComponentFixture<TableFrameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
