import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-high-charts',
	templateUrl: './high-charts.component.html',
	styleUrls: ['./high-charts.component.less']
})
export class HighChartsComponent implements OnInit {

	@Input('highChartsForm') highChartsForm: FormGroup;

	constructor() { }

	get title(): FormGroup {
		return this.highChartsForm.get('title') as FormGroup;
	}

	get titleText(): FormControl {
		return this.title.get('titleText') as FormControl;
	}

	get titleColor(): FormControl {
		return this.title.get('titleColor') as FormControl;
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
		console.log("this.chartBackgroundColor:", this.chartBackgroundColor.value);
		console.log("this.chartBorderColor:", this.chartBorderColor.value);
	}
}
