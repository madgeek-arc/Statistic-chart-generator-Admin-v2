import {
  Component,
  DestroyRef,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ChartTableModalContext } from "../modals/chart-table-modal/chart-table-modal.component";
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UrlProviderService } from '../services/url-provider-service/url-provider.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { FormFactoryService } from "../services/form-factory-service/form-factory-service";
import UIkit from 'uikit';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnChanges {
	private destroyRef = inject(DestroyRef);

	@ViewChild('stepper') stepper !: MatStepper;

	diagramSettings: FormGroup;

	viewSelectionLabel: string = "View";
	categorySelectionLabel: string = "Chart type";
	selectedCategory: string = "";
	configureDatasieriesLabel: string = "Data";
	selectedDataseries: string = "";
	customiseAppearanceLabel: string = "Appearance";

	iframeUrl: string = '';

	open = true;
	hasDataAndDiagramType: boolean = false;
	frameUrl: SafeResourceUrl;

	jsonLoad: boolean = false;

	dialogData: ChartTableModalContext = {
		chartObj: this.dynamicFormHandlingService.ChartObject,
		tableObj: this.dynamicFormHandlingService.TableObject,
		rawChartDataObj: this.dynamicFormHandlingService.RawChartDataObject,
		rawDataObj: this.dynamicFormHandlingService.RawDataObject
	};

  constructor(
    public dynamicFormHandlingService: DynamicFormHandlingService,
    private formFactory: FormFactoryService,
    private urlProvider: UrlProviderService,
    private sanitizer: DomSanitizer,
    public chartExportingService: ChartExportingService
  ) {
    this.frameUrl = this.getSanitizedFrameUrl(urlProvider.serviceURL + '/chart');
  }

	ngOnInit(): void {

    this.diagramSettings = this.formFactory.createForm();

    this.diagramSettings.get('view.profile')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((profile: string) => {

      console.log("New View Selected.");
      console.log((profile && !this.jsonLoad));
      // if (profile && !this.firstTime && !this.jsonLoad) {
      if (profile && !this.jsonLoad) {
        console.log("resetting diagramSettings");
        this.newViewSelected(profile);
      }

      this.checkDisabledTabs();
    });

		this.category.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((diagram: any) => {
			this.checkDisabledTabs();
		});

		this.diagramSettings.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
			this.dynamicFormHandlingService.formSchemaObject = value;
		});

		this.dynamicFormHandlingService.jsonLoaded.pipe(takeUntilDestroyed(this.destroyRef)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: data => {

				if (data) {
					try {
						this.jsonLoad = true;
						console.log("this.formGroup", this.diagramSettings.value);

						this.dynamicFormHandlingService.adjustAndPatchForm(this.diagramSettings);
						console.log("this.dynamicFormHandlingService.jsonLoaded", this.diagramSettings.value);
						console.log("this.dynamicFormHandlingService.loadFormObject", this.dynamicFormHandlingService.loadFormObject);
						this.diagramSettings.patchValue(this.dynamicFormHandlingService.loadFormObject)

						this.updateStepper({
							name: this.diagramSettings?.get('category')?.get('diagram')?.get('type')?.value,
							step: "category"
						})
					} catch (error) {
						console.error('Error processing loaded JSON form data:', error);
						this.jsonLoad = false;
					}
				} else {
					this.jsonLoad = false;
				}
			},
			error: error => {
				console.error('Error in jsonLoaded subscription:', error);
				this.jsonLoad = false;
			}
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		const stringObj = JSON.stringify(changes['chart'].currentValue);
		console.log('[chart-frame.component] On changes: ' + stringObj);

		if (changes['chart'].currentValue) {
			this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.createChartURL(changes['chart'].currentValue));
			console.log(this.frameUrl);
		} else {
			this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart');
		}
	}

	get testingView() {
		return this.diagramSettings.get('testingView') as FormControl;
	}

	get view() {
		return this.diagramSettings.get('view') as FormGroup;
	}

	get profile() {
		return this.diagramSettings.get('view.profile') as FormControl;
	}

	get category() {
		return this.diagramSettings.get('category') as FormGroup;
	}

	get categoryName() {
		return this.diagramSettings.get('category')?.get('diagram')?.get('name') as FormControl;
	}

	get dataseries() {
		return this.diagramSettings.get('dataseries') as FormArray;
	}

	get appearance() {
		return this.diagramSettings.get('appearance') as FormGroup;
	}

	onStepChange(event: any): void {
		console.log("onStepChange:", event.selectedIndex);
	}

	updateStepper(event: any): void {
		console.log("updateStepper EVENT:", event);
		console.log("updateStepper category:", this.category.value);

		this.diagramSettings.updateValueAndValidity();

    this.checkDisabledTabs();

		// this.firstTime = false;
		if (event) {
			if (event.step === 'profile') {
        setTimeout(() => {
          UIkit.switcher('#navTab').show(1);
        }, 0);
			} else if (event.step === 'category') {
				this.selectedCategory = event.name;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(2);
        }, 0);
			}
		}

		this.moveToNextStep();
	}

	checkDisabledTabs() {
		console.log("this.category.get('diagram')?.value", this.category.get('diagram')?.value);
    console.log("this.category.get('diagram')?.get('description')?.value", this.category.get('diagram')?.get('description')?.value);
    console.log("this.category.get('diagram')?.get('description')?.value", this.category.get('diagram')?.value.description);
    setTimeout(() => {
      console.log("this.category.get('diagram')?.get('type')?.value", this.category.get('diagram')?.get('type')?.value);
    }, 50);
		// console.log("this.category.get('diagram')?.get('type')?.value", this.category.get('diagram')?.get('type')?.value);

    // console.log("diagram control:", this.category.get('diagram'));
    // console.log("diagram control type:", this.category.get('diagram') instanceof FormGroup ? 'FormGroup' : 'FormControl');




    if (this.diagramSettings) {
			if (this.view.get('profile')?.value && this.category.get('diagram')?.get('type')?.value) {
				this.hasDataAndDiagramType = true;
			} else {
				this.hasDataAndDiagramType = false;
			}
		}
	}


	moveToNextStep(): void {
		setTimeout(() => {
			this.diagramSettings.updateValueAndValidity();
			window.scroll(0, 0);
		}, 50);
	}

	newViewSelected(profile: any): void {

    console.log("diagram control:", this.category.get('diagram'));
    console.log("diagram control type:", this.category.get('diagram') instanceof FormGroup ? 'FormGroup' : 'FormControl');

    this.category.reset();

    console.log("diagram control:", this.category.get('diagram'));
    console.log("diagram control type:", this.category.get('diagram') instanceof FormGroup ? 'FormGroup' : 'FormControl');

    this.dataseries.reset();
		// this.appearance.reset();

		this.resetForm();
		this.updateDefaultFormGroupValues();
		this.diagramSettings.updateValueAndValidity();

		this.selectedCategory = '';
		this.selectedDataseries = '';
		// this.selectedAppearance = '';
	}

	resetForm(): void {

    this.diagramSettings.setControl('category', this.formFactory.createCategoryGroup());
    this.diagramSettings.setControl('dataseries', this.formFactory.createDataseriesGroup());
    this.diagramSettings.setControl('appearance', this.formFactory.createAppearanceGroup());

		this.diagramSettings.get('appearance')?.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions')?.disable();
		this.diagramSettings.get('appearance')?.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions')?.disable();
	}

	updateDefaultFormGroupValues(): void {
		this.appearance.get('tableAppearance')?.get('paginationSize')?.setValue(30);
		this.appearance.get('chartAppearance')?.get('generalOptions')?.get('visualisationLibrary')?.setValue('HighCharts');
		this.appearance.get('chartAppearance')?.get('generalOptions')?.get('resultsLimit')?.setValue(30);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('chartArea')?.get('borderColor')?.setValue('#335cad');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('titleColor')?.setValue('#333333');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('horizontalAlignment')?.setValue('center');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('margin')?.setValue(15);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('fontSize')?.setValue(18);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('subtitle')?.get('subtitleColor')?.setValue('#666666');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('subtitle')?.get('horizontalAlignment')?.setValue('center');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('xAxis')?.get('fontSize')?.setValue(11);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('xAxis')?.get('xAxisColor')?.setValue('#666666');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('yAxis')?.get('fontSize')?.setValue(11);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('yAxis')?.get('yAxisColor')?.setValue('#666666');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('miscOptions')?.get('enableExporting')?.setValue(true);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('miscOptions')?.get('enableExporting')?.setValue('disabled');

	}

	submitData() {
		console.log("SUBMIT this form:", this.diagramSettings.value);

		this.dynamicFormHandlingService.submitForm();

		const data: ChartTableModalContext = {
			chartObj: this.dynamicFormHandlingService.ChartObject,
			tableObj: this.dynamicFormHandlingService.TableObject,
			rawChartDataObj: this.dynamicFormHandlingService.RawChartDataObject,
			rawDataObj: this.dynamicFormHandlingService.RawDataObject
		}

		this.dialogData = data;

		console.log("THIS IS THE DATA:", data);
	}

	clearData() {
		console.log("CLEAR ALL DATA!");
	}


	toggleSidebar() {

		const el: HTMLElement | null = document.getElementById('sidebar');
		if (el === null)
			return;

		if (!el.classList.contains('sidebar_mini')) {
			el.classList.add('sidebar_mini');
			el.classList.remove('sidebar_main_active');
		} else {
			el.classList.add('sidebar_main_active');
			el.classList.remove('sidebar_mini');
		}
	}

	getSanitizedFrameUrl(url: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
