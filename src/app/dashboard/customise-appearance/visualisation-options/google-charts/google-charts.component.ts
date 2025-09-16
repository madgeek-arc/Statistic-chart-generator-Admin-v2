import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-google-charts',
	templateUrl: './google-charts.component.html',
	styleUrls: ['./google-charts.component.less']
})
export class GoogleChartsComponent {

	@Input('googleChartsForm') googleChartsForm: FormGroup;

	protected stackedGraphList = [
		{ label: 'Disabled', value: 'disabled' },
		{ label: 'Stacked by Value', value: 'stackedByValue' },
		{ label: 'Stacked by Percentage', value: 'stackedByPercentage' }
	];

	constructor() { }

	ngOnInit(): void {
		if (this.googleChartsForm && this.googleChartsForm.value) {
			console.log("this.googleChartsForm:", this.googleChartsForm.value);
		}
	}


	testButton(): void {
		console.log("this.googleChartsForm:", this.googleChartsForm.value);
	}

}
