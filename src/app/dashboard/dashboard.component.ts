import { CdkStepper } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Profile } from '../services/profile-provider/profile-provider.service';

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

	profileSelectionLabel: string = "Select Profile";
	selectedProfile: string = "";
	categorySelectionLabel: string = "Select Category";
	selectedCategory: string = "";
	configureDatasieriesLabel: string = "Configure Dataseries";
	selectedDataseries: string = "";
	customiseAppearanceLabel: string = "Customise Appearance";
	selectedAppearance: string = '';


	constructor(
		private formBuilder: FormBuilder
	) {
		this.formGroup = this.formBuilder.group({
			profile: this.formBuilder.control(null, Validators.required),
			category: this.formBuilder.control(null, Validators.required),
			dataseries: this.formBuilder.group({
				entity: this.formBuilder.control(null, Validators.required)
			}),
			appearance: this.formBuilder.group({
				color: this.formBuilder.control(null)
			})
		})
	}


	ngOnInit(): void {
		this.profile.valueChanges.subscribe((profile: Profile) => {
			if (profile) {
				this.newViewSelected();
			}
		});
	}

	get profile() {
		return this.formGroup.get('profile') as FormControl;
	}

	get category() {
		return this.formGroup.get('category') as FormControl;
	}

	get dataseries() {
		return this.formGroup.get('dataseries') as FormGroup;
	}

	get appearance() {
		return this.formGroup.get('appearance') as FormGroup;
	}

	onStepChange(event: any): void {
		console.log("onStepChange:", event.selectedIndex);
	}

	updateStepper(event: any): void {
		if (event) {
			if (event.step === 'profile') {
				this.selectedProfile = event.name;
			} else if (event.step === 'category') {
				this.selectedCategory = event.name;
			}
		}

		this.moveToNextStep()
	}

	moveToNextStep(): void {
		setTimeout(() => {
			this.stepper.next();
			this.formGroup.updateValueAndValidity();
		}, 1);
	}

	newViewSelected(): void {
		this.category.reset();
		this.dataseries.reset();
		this.appearance.reset();
		this.formGroup.updateValueAndValidity();
		this.selectedCategory = '';
		this.selectedDataseries = '';
		this.selectedAppearance = '';
	}

	testLog() {
		console.log("TESTING formGroup:", this.formGroup.value);
	}

	submitTest() {
		console.log("SUBMIT:", this.formGroup.value);
	}
}
