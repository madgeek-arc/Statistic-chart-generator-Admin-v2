import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-customise-appearance',
	templateUrl: './customise-appearance.component.html',
	styleUrls: ['./customise-appearance.component.less']
})

export class CustomiseAppearanceComponent implements OnInit {

	@Input('appearanceForm') appearanceForm: FormGroup;


	// TODO
	// comes from backend!
	protected visualisationLibraryList = [
		{ name: 'HighCharts', value: 'HighCharts' },
		{ name: 'GoogleCharts', value: 'GoogleCharts' },
		{ name: 'eCharts', value: 'eCharts' }
	];

	protected orderByList = [
		{ name: 'X Axis', value: 'xAxis' },
		{ name: 'Y Axis', value: 'yAxis' }
	];

	constructor() { }

	ngOnInit() { }

	libraryChange(event: any) {
		console.log("Event:", event);
		const newLibrary: string = event.value;

		if (newLibrary === 'HighCharts') {
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('highchartsAppearanceOptions')?.enable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions')?.disable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions')?.disable();
		} else if (newLibrary === 'GoogleCharts') {
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('highchartsAppearanceOptions')?.disable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions')?.enable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions')?.disable();
		} else if (newLibrary === 'eCharts') {
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('highchartsAppearanceOptions')?.disable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions')?.disable();
			this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions')?.enable();
		}
	}

	testing() {
		console.log("Appearance Form:", this.appearanceForm);
		console.log("Appearance Form Value:", this.appearanceForm.value);
	}

	get chartAppearance(): FormGroup {
		return this.appearanceForm.get('chartAppearance') as FormGroup;
	}

	get generalOptions(): FormGroup {
		return this.chartAppearance.get('generalOptions') as FormGroup;
	}

	get visualisationLibrary(): FormControl {
		return this.generalOptions.get('visualisationLibrary') as FormControl;
	}

	get visualisationOptions(): FormGroup {
		return this.chartAppearance.get('visualisationOptions') as FormGroup;
	}

	get highCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('highchartsAppearanceOptions') as FormGroup;
		// return this.visualisationOptions.get('highchartsAppearanceOptions') as FormGroup
	}

	get googleCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions') as FormGroup;
		// return this.visualisationOptions.get('googlechartsAppearanceOptions') as FormGroup
	}

	get eCharts(): FormGroup {
		return this.appearanceForm.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions') as FormGroup;
		// return this.visualisationOptions.get('echartsAppearanceOptions') as FormGroup
	}


}
