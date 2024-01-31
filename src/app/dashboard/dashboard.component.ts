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

	stepIndex: number = 0;

	isLinear: boolean = true;
	viewSelectionLabel: string = "Select View";
	selectedView: string = "";
	categorySelectionLabel: string = "Select Category";
	configureDatasieriesLabel: string = "Configure Dataseiries";
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
		if (event) {
			this.selectedView = event;
		}

		this.moveToNextStep()
	}

	moveToNextStep(): void {
		this.stepper.selectedIndex = this.stepIndex + 1;
	}
}
