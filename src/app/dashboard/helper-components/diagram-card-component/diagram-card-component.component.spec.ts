import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramCardComponentComponent } from './diagram-card-component.component';

describe('DiagramCardComponentComponent', () => {
  let component: DiagramCardComponentComponent;
  let fixture: ComponentFixture<DiagramCardComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiagramCardComponentComponent]
    });
    fixture = TestBed.createComponent(DiagramCardComponentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('diagram', { type: 'bar', supportedLibraries: [] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // The component is OnPush, so a changed signal input has to re-render it.
  it('re-renders when the isSelected input changes', () => {
    expect(fixture.nativeElement.querySelector('.dc-card--selected')).toBeNull();

    fixture.componentRef.setInput('isSelected', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dc-card--selected')).not.toBeNull();
  });

  it('emits its diagram when clicked', () => {
    const emitted: unknown[] = [];
    component.outputEvent.subscribe(diagram => emitted.push(diagram));

    fixture.nativeElement.querySelector('.dc-card').click();

    expect(emitted).toEqual([{ type: 'bar', supportedLibraries: [] }]);
  });
});
