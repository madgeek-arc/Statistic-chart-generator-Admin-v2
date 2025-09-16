import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-customise-appearance',
	templateUrl: './customise-appearance.component.html',
	styleUrls: ['./customise-appearance.component.less']
})

export class CustomiseAppearanceComponent {

	@Input('appearanceForm') appearanceForm: FormGroup;


	// TODO
	// comes from backend!
	protected visualisationLibraryList = [
		{ label: 'HighCharts', value: 'HighCharts' },
		{ label: 'GoogleCharts', value: 'GoogleCharts' },
		{ label: 'eCharts', value: 'eCharts' }
	];

	protected orderByList = [
		{ label: 'X Axis', value: 'xaxis' },
		{ label: 'Y Axis', value: 'yaxis' }
	];

	libraryChange(event: any) {
		const newLibrary: string = event.value;

    this.appearanceForm.get('chartAppearance.highchartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.googlechartsAppearanceOptions').disable();
    this.appearanceForm.get('chartAppearance.echartsAppearanceOptions').disable();

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


}
