import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/input.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { refreshOnFormChanges } from '../../../../shared/refresh-on-form-changes';

@Component({
    selector: 'app-e-charts',
    templateUrl: './e-charts.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, InputComponent, MatSlideToggle]
})

export class EChartsComponent {

	readonly eChartsForm = input<FormGroup>(undefined);

	constructor() {
		refreshOnFormChanges(this.eChartsForm);
	}

	protected horizontalAlignmentList = [
		{ label: 'Left', value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right', value: 'right' }
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
