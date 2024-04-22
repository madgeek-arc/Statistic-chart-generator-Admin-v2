import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-customise-appearance',
	templateUrl: './customise-appearance.component.html',
	styleUrls: ['./customise-appearance.component.less']
})

export class CustomiseAppearanceComponent implements OnInit {

	@Input('appearanceForm') appearanceForm: FormGroup;


	protected visualisationLibraryList = [
		{ name: 'HighCharts', value: 'highCharts' },
		{ name: 'GoogleCharts', value: 'googleCharts' },
		{ name: 'eCharts', value: 'eCharts' }
	];

	protected orderByList = [
		{ name: 'X Axis', value: 'xAxis' },
		{ name: 'Y Axis', value: 'yAxis' }
	];

	constructor() { }

	get chartAppearance(): FormGroup {
		return this.appearanceForm.get('chartAppearance') as FormGroup;
	}

	get generalOptions(): FormGroup {
		return this.chartAppearance.get('generalOptions') as FormGroup;
	}

	get visualisationLibrary(): FormControl {
		return this.generalOptions.get('visualisationLibrary') as FormControl;
	}

	get resultsLimit(): FormControl {
		return this.generalOptions.get('resultsLimit') as FormControl;
	}

	get orderBy(): FormControl {
		return this.generalOptions.get('orderBy') as FormControl;
	}


	get tableAppearance(): FormGroup {
		return this.appearanceForm.get('tableAppearance') as FormGroup;
	}

	get tablePageSize(): FormControl {
		return this.tableAppearance.get('tablePageSize') as FormControl;
	}

	ngOnInit(): void { }
}
