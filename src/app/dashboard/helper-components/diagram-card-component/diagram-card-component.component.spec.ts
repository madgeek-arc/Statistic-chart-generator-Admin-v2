import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramCardComponentComponent } from './diagram-card-component.component';

describe('CardComponentComponent', () => {
  let component: DiagramCardComponentComponent;
  let fixture: ComponentFixture<DiagramCardComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiagramCardComponentComponent]
    });
    fixture = TestBed.createComponent(DiagramCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
