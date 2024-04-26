import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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

	constructor() { }

	// title 
	get title(): FormGroup {
		return this.highChartsForm.get('title') as FormGroup;
	}

	get titleText(): FormControl {
		return this.title.get('titleText') as FormControl;
	}

	get titleColor(): FormControl {
		return this.title.get('titleColor') as FormControl;
	}

	get titleHorizontalAlignment(): FormControl {
		return this.title.get('horizontalAlignment') as FormControl;
	}

	get titleMargin(): FormControl {
		return this.title.get('margin') as FormControl;
	}

	get titleFontSize(): FormControl {
		return this.title.get('fontSize') as FormControl;
	}

	// subtitle 
	get subtitle(): FormGroup {
		return this.highChartsForm.get('subtitle') as FormGroup;
	}

	get subtitleText(): FormControl {
		return this.subtitle.get('subtitleText') as FormControl;
	}

	get subtitleColor(): FormControl {
		return this.subtitle.get('subtitleColor') as FormControl;
	}

	get subtitleHorizontalAlignment(): FormControl {
		return this.subtitle.get('horizontalAlignment') as FormControl;
	}

	get subtitleFontSize(): FormControl {
		return this.subtitle.get('fontSize') as FormControl;
	}

	// xAxis 
	get xAxis(): FormGroup {
		return this.highChartsForm.get('xAxis') as FormGroup;
	}

	get xAxisName(): FormControl {
		return this.xAxis.get('xAxisName') as FormControl;
	}

	get xAxisFontSize(): FormControl {
		return this.xAxis.get('fontSize') as FormControl;
	}

	get xAxisColor(): FormControl {
		return this.xAxis.get('color') as FormControl;
	}

	// yAxis
	get yAxis(): FormGroup {
		return this.highChartsForm.get('yAxis') as FormGroup;
	}

	get yAxisName(): FormControl {
		return this.yAxis.get('yAxisName') as FormControl;
	}

	get yAxisFontSize(): FormControl {
		return this.yAxis.get('fontSize') as FormControl;
	}

	get yAxisColor(): FormControl {
		return this.yAxis.get('color') as FormControl;
	}

	get miscOptions(): FormGroup {
		return this.highChartsForm.get('miscOptions') as FormGroup;
	}

	get enableExporting(): FormControl {
		return this.miscOptions.get('enableExporting') as FormControl;
	}

	get stackedGraph(): FormControl {
		return this.miscOptions.get('stackedGraph') as FormControl;
	}



	get chartArea(): FormGroup {
		return this.highChartsForm.get('chartArea') as FormGroup;
	}

	get chartBackgroundColor(): FormControl {
		return this.chartArea.get('backgroundColor') as FormControl;
	}

	get chartBorderColor(): FormControl {
		return this.chartArea.get('borderColor') as FormControl;
	}




	ngOnInit(): void {
		console.log("this.chartBorderColor:", this.chartBorderColor.value);
	}

	testButton(): void {
		console.log("this.highChartsForm:", this.highChartsForm.value);
	}
}
