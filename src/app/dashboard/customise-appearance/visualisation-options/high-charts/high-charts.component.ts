import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-high-charts',
	templateUrl: './high-charts.component.html',
	styleUrls: ['./high-charts.component.less']
})
export class HighChartsComponent implements OnInit {

	@Input('highChartsForm') highChartsForm: FormGroup;

	protected horizontalAlignmentList = [
		{ name: 'Left', value: 'left' },
		{ name: 'Center', value: 'center' },
		{ name: 'Right', value: 'right' }
	];

	protected stackedGraphList = [
		{ name: 'Disabled', value: 'disabled' },
		{ name: 'Stacked by Value', value: 'stackedByValue' },
		{ name: 'Stacked by Percentage', value: 'stackedByPercentage' }
	];

	protected itemLayoutList = [
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' }
	]

	protected verticalAlignmentList = [
		{ name: 'Top', value: 'top' },
		{ name: 'Middle', value: 'middle' },
		{ name: 'Bottom', value: 'bottom' }
	];

	constructor() { }


	ngOnInit(): void {
		if (this.highChartsForm && this.highChartsForm.value) {
			console.log("this.highChartsForm:", this.highChartsForm.value);
		}
	}

	addSeriesColor(): void {
		console.log("Add series color.");
	}


	testButton(): void {
		console.log("this.highChartsForm:", this.highChartsForm.value);
	}
}
