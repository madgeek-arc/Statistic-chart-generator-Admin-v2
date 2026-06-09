import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-high-charts',
    templateUrl: './high-charts.component.html',
    standalone: false
})
export class HighChartsComponent {

	@Input() highChartsForm: FormGroup;

	protected horizontalAlignmentList = [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' }
	];

	protected stackedGraphList = [
		{ label: 'Disabled', value: 'null' },
		{ label: 'Stacked by Value', value: 'normal' },
		{ label: 'Stacked by Percentage', value: 'percent' }
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

  getSeriesColors(form: FormGroup) {
    return (form.get('dataSeriesColorArray') as FormArray).controls;
	}

  addSeriesColor(form: FormGroup): void {
    (form.get('dataSeriesColorArray') as FormArray).push(new FormControl<string>('#ffffff'));
  }

  removeSeriesColor(form: FormGroup, index: number) {
    (form.get('dataSeriesColorArray') as FormArray).removeAt(index);
  }

}
