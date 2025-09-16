import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-e-charts',
	templateUrl: './e-charts.component.html',
	styleUrls: ['./e-charts.component.less']
})
export class EChartsComponent {

	@Input('eChartsForm') eChartsForm: FormGroup;

	protected horizontalAlignmentList = [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' }
	];

	protected stackedGraphList = [
		{ name: 'Disabled', value: 'disabled' },
		{ name: 'Stacked by Value', value: 'stackedByValue' },
		{ name: 'Stacked by Percentage', value: 'stackedByPercentage' }
	];

	protected itemLayoutList = [
		{ label: 'Horizontal', value: 'horizontal' },
		{ label: 'Vertical', value: 'vertical' }
	]

	protected verticalAlignmentList = [
		{ label: 'Top', value: 'top' },
		{ label: 'Middle', value: 'middle' },
		{ label: 'Bottom', value: 'bottom' }
	];

	constructor() { }

	getSeriesColors(form: any) {
		// console.log(form.controls.data.controls.filters.controls);
		return form.controls.dataSeriesColorArray.controls;
	}

	ngOnInit(): void {
		if (this.eChartsForm && this.eChartsForm.value) {
			console.log("this.eChartsForm:", this.eChartsForm.value);
		}
	}

	addSeriesColor(form: any): void {
		form.controls.dataSeriesColorArray.push(new FormControl<string>('#ffffff'));
	}

	removeSeriesColor(form: any, index: number) {
		form.controls.dataSeriesColorArray.removeAt(index);
	}

}
