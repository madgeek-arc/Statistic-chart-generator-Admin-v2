import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-high-charts',
	templateUrl: './high-charts.component.html',
	styleUrls: ['./high-charts.component.less']
})
export class HighChartsComponent implements OnInit {

	@Input() highChartsForm: FormGroup;

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

  ngOnInit(): void {
    if (this.highChartsForm && this.highChartsForm.value) {
      console.log("this.highChartsForm:", this.highChartsForm.value);
    }
  }

  getSeriesColors(form: FormGroup) {
    return (form.get('dataSeriesColorPalette') as FormArray).controls;
	}

  addSeriesColor(form: FormGroup): void {
    (form.get('dataSeriesColorPalette') as FormArray).push(new FormControl<string>('#ffffff'));
  }

  removeSeriesColor(form: FormGroup, index: number) {
    (form.get('dataSeriesColorPalette') as FormArray).removeAt(index);
  }

}
