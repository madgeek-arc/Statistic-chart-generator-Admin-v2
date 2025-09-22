import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";

@Component({
	selector: 'app-customise-appearance',
	templateUrl: './customise-appearance.component.html',
})

export class CustomiseAppearanceComponent implements OnInit {

	appearanceForm: FormGroup | null = null;

  visualisationLibraryList: string[] = [];
  orderByList = [
		{ label: 'X Axis', value: 'xaxis' },
		{ label: 'Y Axis', value: 'yaxis' }
	];

  constructor(private formFactoryService: FormFactoryService) { }

  ngOnInit() {
    this.appearanceForm = this.formFactoryService.getFormRoot().get('appearance') as FormGroup;

    this.visualisationLibraryList = this.formFactoryService.getFormRoot().get('category.diagram.supportedLibraries').value;
    this.setInitialLibrary();

    this.formFactoryService.getFormRoot().get('category.diagram.supportedLibraries').valueChanges.subscribe({
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

	libraryChange(event: string) {
		const newLibrary = event;
    console.log(newLibrary);
    this.appearanceForm.get('chartAppearance.highchartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.googlechartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.echartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.highmapsAppearanceOptions').disable();

    switch (newLibrary) {
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

    console.log(this.appearanceForm.value);
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
