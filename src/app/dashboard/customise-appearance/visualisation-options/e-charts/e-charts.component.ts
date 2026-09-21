import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/input.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-e-charts',
    templateUrl: './e-charts.component.html',
    imports: [ReactiveFormsModule, InputComponent, MatSlideToggle]
})

export class EChartsComponent implements OnInit {

	@Input() eChartsForm: FormGroup;

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

  ngOnInit(): void {
    if (this.eChartsForm && this.eChartsForm.value) {
      console.log("this.eChartsForm:", this.eChartsForm.value);
    }
  }

	getSeriesColors(form: any) {
		return form.controls.dataSeriesColorArray.controls;
	}

	addSeriesColor(form: any): void {
		form.controls.dataSeriesColorArray.push(new FormControl<string>('#ffffff'));
	}

	removeSeriesColor(form: any, index: number) {
		form.controls.dataSeriesColorArray.removeAt(index);
	}

}
