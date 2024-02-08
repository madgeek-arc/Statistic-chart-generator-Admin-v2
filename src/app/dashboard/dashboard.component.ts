import { CdkStepper } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
	@ViewChild('stepper') stepper !: MatStepper;

	formGroup: FormGroup;

	isStep1Done: boolean = false;
	isStep2Done: boolean = false;

	isLinear: boolean = true;
	viewSelectionLabel: string = "Select View";
	selectedView: string = "";
	categorySelectionLabel: string = "Select Category";
	configureDatasieriesLabel: string = "Configure Dataseries";
	customiseAppearanceLabel: string = "Customise Appearance";

	constructor(
		private formBuilder: FormBuilder
	) {
		this.formGroup = this.formBuilder.group({
			firstFormGroup: this.formBuilder.group({
				title: this.formBuilder.control('Placeholder Title', Validators.required)
			}),
			secondFormGroup: this.formBuilder.group({
				description: this.formBuilder.control('Placeholder Description', Validators.required)
			})
		})
	}


	ngOnInit(): void {
	}

	get firstFormGroup() {
		return this.formGroup.get('firstFormGroup') as FormGroup;
	}

	get secondFormGroup() {
		return this.formGroup.get('secondFormGroup') as FormGroup;
	}

	updateStepper(event: any): void {
		console.log("Event:", event);
		if (event) {
			this.selectedView = event;
		}

		this.moveToNextStep()
	}

	moveToNextStep(): void {
		console.log("isLinear:", this.isLinear);
		console.log("this.isStep1Done:", this.isStep1Done);

		if (this.stepper.selectedIndex === 0) {
			this.isStep1Done = true;
		}
		setTimeout(() => {           // or do some API calls/ Async events
			this.stepper.next();
			console.log("this.isStep1Done:", this.isStep1Done);
		}, 1);

		// if (this.stepper.selectedIndex === 0) {
		// 	this.step2Editable = true;
		// } else if (this.stepper.selectedIndex === 1) {
		// 	this.step3Editable = true;
		// }
		// this.stepper.selectedIndex += + 1;
	}

	testLog() {
		console.log("this.isStep1Done:", this.isStep1Done);
	}
}
