import { Component, OnInit, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/input.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-google-charts',
    templateUrl: './google-charts.component.html',
    imports: [ReactiveFormsModule, InputComponent, MatSlideToggle, MatIcon]
})
export class GoogleChartsComponent implements OnInit {

	readonly googleChartsForm = input<FormGroup>(undefined);

	protected stackedGraphList = [
		{ label: 'Disabled', value: 'disabled' },
		{ label: 'Stacked by Value', value: 'stackedByValue' },
		{ label: 'Stacked by Percentage', value: 'stackedByPercentage' }
	];

	constructor() { }

	ngOnInit(): void {
		const googleChartsForm = this.googleChartsForm();
		if (googleChartsForm && googleChartsForm.value) {
			console.log("this.googleChartsForm:", googleChartsForm.value);
		}
	}

}
