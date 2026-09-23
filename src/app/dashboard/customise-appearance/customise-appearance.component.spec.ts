import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { CustomiseAppearanceComponent } from './customise-appearance.component';
import { DynamicFormHandlingService } from '../../services/dynamic-form-handling-service/dynamic-form-handling.service';
import { FormFactoryService } from '../../services/form-factory-service/form-factory-service';

// The panel shown depends on the visualisation library, which changes without any event inside
// this component: when the chosen chart type's supported libraries change, and when a saved chart
// loads (a silent write with `emitEvent: false`, then DynamicFormHandlingService.updateFromFile = false).
describe('CustomiseAppearanceComponent', () => {
  let fixture: ComponentFixture<CustomiseAppearanceComponent>;
  let root: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomiseAppearanceComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    root = TestBed.inject(FormFactoryService).createForm();
    fixture = TestBed.createComponent(CustomiseAppearanceComponent);
    fixture.detectChanges();
  });

  const panel = (): string[] => ['app-high-charts', 'app-google-charts', 'app-e-charts', 'app-high-maps']
    .filter(tag => fixture.nativeElement.querySelector(tag) !== null);
  const library = () => root.get('appearance.chartAppearance.generalOptions.visualisationLibrary') as FormControl;

  it('switches panel when the chart type only supports another library', () => {
    (root.get('category.diagram.supportedLibraries') as FormArray).push(new FormControl('GoogleCharts'));
    fixture.detectChanges();

    expect(panel()).toEqual(['app-google-charts']);
  });

  it('switches panel when a saved chart with another library finishes loading', () => {
    (root.get('category.diagram.supportedLibraries') as FormArray).push(new FormControl('HighCharts'));
    fixture.detectChanges();
    expect(panel()).toEqual(['app-high-charts']);

    library().setValue('eCharts', { emitEvent: false });
    TestBed.inject(DynamicFormHandlingService).updateFromFile = false;
    fixture.detectChanges();

    expect(panel()).toEqual(['app-e-charts']);
  });
});
