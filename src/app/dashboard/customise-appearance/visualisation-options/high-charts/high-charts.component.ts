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

	// title 
	get title(): FormGroup {
		return this.highChartsForm.get('title') as FormGroup;
	}

	get titleText(): FormControl {
		return this.title.get('text') as FormControl;
	}

	get titleColor(): FormControl {
		return this.title.get('color') as FormControl;
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
		return this.subtitle.get('text') as FormControl;
	}

	get subtitleColor(): FormControl {
		return this.subtitle.get('color') as FormControl;
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
		return this.xAxis.get('name') as FormControl;
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
		return this.yAxis.get('name') as FormControl;
	}

	get yAxisFontSize(): FormControl {
		return this.yAxis.get('fontSize') as FormControl;
	}

	get yAxisColor(): FormControl {
		return this.yAxis.get('color') as FormControl;
	}

	// Misc Options
	get miscOptions(): FormGroup {
		return this.highChartsForm.get('miscOptions') as FormGroup;
	}

	get enableExporting(): FormControl {
		return this.miscOptions.get('enableExporting') as FormControl;
	}

	get enableDrilldown(): FormControl {
		return this.miscOptions.get('enableDrilldown') as FormControl;
	}

	get stackedGraph(): FormControl {
		return this.miscOptions.get('stackedGraph') as FormControl;
	}


	// Chart Area
	get chartArea(): FormGroup {
		return this.highChartsForm.get('chartArea') as FormGroup;
	}

	get chartBackgroundColor(): FormControl {
		return this.chartArea.get('backgroundColor') as FormControl;
	}

	get chartBorderColor(): FormControl {
		return this.chartArea.get('borderColor') as FormControl;
	}

	get chartBorderCornerRadius(): FormControl {
		return this.chartArea.get('borderCornerRadius') as FormControl;
	}

	get chartBorderWidth(): FormControl {
		return this.chartArea.get('borderWidth') as FormControl;
	}


	// Plot Area
	get plotArea(): FormGroup {
		return this.highChartsForm.get('plotArea') as FormGroup;
	}

	get plotBackgroundColor(): FormControl {
		return this.plotArea.get('backgroundColor') as FormControl;
	}

	get plotBorderColor(): FormControl {
		return this.plotArea.get('borderColor') as FormControl;
	}

	get plotBackgroundImageUrl(): FormControl {
		return this.plotArea.get('backgroundImageUrl') as FormControl;
	}

	get plotBorderWidth(): FormControl {
		return this.plotArea.get('borderWidth') as FormControl;
	}


	// Data Labels
	get dataLabels(): FormGroup {
		return this.highChartsForm.get('dataLabels') as FormGroup;
	}

	get enableData(): FormControl {
		return this.dataLabels.get('enableData') as FormControl;
	}


	// Credits
	get credits(): FormGroup {
		return this.highChartsForm.get('credits') as FormGroup;
	}

	get enableCredits(): FormControl {
		return this.credits.get('enableCredits') as FormControl;
	}


	// Legend
	get legend(): FormGroup {
		return this.highChartsForm.get('legend') as FormGroup;
	}

	get enableLegend(): FormControl {
		return this.legend.get('enableLegend') as FormControl;
	}

	get itemlayout(): FormControl {
		return this.legend.get('itemlayout') as FormControl;
	}

	get legendHorizontalAlignment(): FormControl {
		return this.legend.get('horizontalAlignment') as FormControl;
	}

	get legendVerticalAlignment(): FormControl {
		return this.legend.get('verticalAlignment') as FormControl;
	}


	// Zoom Options
	get zoomOptions(): FormGroup {
		return this.highChartsForm.get('zoomOptions') as FormGroup;
	}

	get enableXAxisZoom(): FormControl {
		return this.zoomOptions.get('enableXAxisZoom') as FormControl;
	}

	get enableYAxisZoom(): FormControl {
		return this.zoomOptions.get('enableYAxisZoom') as FormControl;
	}


	// Data Series Color Palette
	get dataSeriesColorPalette(): FormArray {
		return this.highChartsForm.get('dataSeriesColorPalette') as FormArray;
	}







	ngOnInit(): void {
		console.log("this.chartBorderColor:", this.chartBorderColor.value);
	}

	addSeriesColor(): void {
		console.log("Add series color.");
	}


	testButton(): void {
		console.log("this.highChartsForm:", this.highChartsForm.value);
	}
}
