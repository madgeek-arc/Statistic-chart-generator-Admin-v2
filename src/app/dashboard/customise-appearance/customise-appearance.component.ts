import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";
import { refreshOnFormChanges } from '../../shared/refresh-on-form-changes';
import { InputComponent } from '../../shared/input.component';
import { HighChartsComponent } from './visualisation-options/high-charts/high-charts.component';
import { GoogleChartsComponent } from './visualisation-options/google-charts/google-charts.component';
import { EChartsComponent } from './visualisation-options/e-charts/e-charts.component';
import { HighMapsComponent } from './visualisation-options/high-maps/high-maps.component';

@Component({
    selector: 'app-customise-appearance',
    templateUrl: './customise-appearance.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, InputComponent, HighChartsComponent, GoogleChartsComponent, EChartsComponent, HighMapsComponent]
})

export class CustomiseAppearanceComponent implements OnInit {
	private formFactoryService = inject(FormFactoryService);
	private destroyRef = inject(DestroyRef);

	appearanceForm: FormGroup | null = null;

  visualisationLibraryList: string[] = [];
  orderByList = [
		{ label: 'X Axis', value: 'xaxis' },
		{ label: 'Y Axis', value: 'yaxis' }
	];

  constructor() {
    // The visualisation library changes with the chart type's supported libraries and on chart loads.
    refreshOnFormChanges(this.formFactoryService.root);
  }

  ngOnInit() {
    this.appearanceForm = this.formFactoryService.getFormRoot().get('appearance') as FormGroup;

    this.visualisationLibraryList = this.formFactoryService.getFormRoot().get('category.diagram.supportedLibraries').value;
    this.setInitialLibrary();

    this.formFactoryService.getFormRoot().get('category.diagram.supportedLibraries').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: string[]) => {
        this.visualisationLibraryList = value;
        this.setInitialLibrary();
      }
    });
  }

  setInitialLibrary() {
    if (this.visualisationLibraryList.includes('HighCharts')) {
      this.visualisationLibrary.setValue('HighCharts');
    } else
      this.visualisationLibrary.setValue(this.visualisationLibraryList[0]);

    this.libraryChange(this.visualisationLibrary.value);
  }

	libraryChange(event: unknown) {
    this.appearanceForm.get('chartAppearance.highchartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.googlechartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.echartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.highmapsAppearanceOptions').disable();

    switch (event) {
      case 'HighCharts':
        this.appearanceForm.get('chartAppearance.highchartsAppearanceOptions').enable();
        break;
      case 'GoogleCharts':
        this.appearanceForm.get('chartAppearance.googlechartsAppearanceOptions').enable();
        break;
      case 'eCharts':
        this.appearanceForm.get('chartAppearance.echartsAppearanceOptions').enable();
        break;
      case 'HighMaps':
        this.appearanceForm.get('chartAppearance.highmapsAppearanceOptions').enable();
        break;
    }

	}

	get visualisationLibrary(): FormControl {
		return this.appearanceForm.get('chartAppearance.generalOptions.visualisationLibrary') as FormControl;
	}

	get highCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance.highchartsAppearanceOptions') as FormGroup;
	}

	get googleCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance.googlechartsAppearanceOptions') as FormGroup;
	}

	get eCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance.echartsAppearanceOptions') as FormGroup;
	}

	get highMaps(): FormGroup {
		return this.appearanceForm.get('chartAppearance.highmapsAppearanceOptions') as FormGroup;
	}


}
