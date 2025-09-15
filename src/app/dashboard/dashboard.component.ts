import { Component, DestroyRef, inject, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
	// encapsulation: ViewEncapsulation.None
})

export class DashboardComponent implements OnInit, OnChanges {
	private destroyRef = inject(DestroyRef);

	// @ViewChild('stepper') stepper !: MatStepper;

	diagramSettings: FormGroup;

	viewSelectionLabel: string = "View";
	categorySelectionLabel: string = "Chart type";
	selectedCategory: string = "";
	configureDatasieriesLabel: string = "Data";
	selectedDataseries: string = "";
	customiseAppearanceLabel: string = "Appearance";

	open = true;
	hasDataAndDiagramType: boolean = false;
	frameUrl: SafeResourceUrl;

  frameHeight: number;
  hasChanges: boolean = false;
	// jsonLoad: boolean = false;

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

    this.frameHeight = (3 * window.outerHeight) / 5;
    this.clearData();
    // this.diagramSettings = this.formFactory.createForm();
    // this.setFormObservers();

    this.dynamicFormHandlingService.jsonLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        // this.jsonLoad = data;
        if (data) {
          this.updateFormFile();
        }
      }
    });
	}

  setFormObservers() {

    this.diagramSettings.get('view.profile')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((profile: string) => {

      console.log("New View Selected.");
      if (profile) {
        console.log("resetting diagramSettings");
        this.newViewSelected();
      }

      // this.checkDisabledTabs();
    });

    this.diagramSettings.get('category')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((diagram: any) => {
      this.checkDisabledTabs();
    });

    this.diagramSettings.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.dynamicFormHandlingService.formSchemaObject = value;
      this.hasChanges = true;
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

	updateStepper(event: any): void {
		// this.diagramSettings.updateValueAndValidity();
    this.checkDisabledTabs();

		if (event) {
      if (event.step === 'view') {
        setTimeout(() => {
          UIkit.switcher('#navTab').show(0);
          window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        }, 0);
      } else if (event.step === 'profile') {
        setTimeout(() => {
          UIkit.switcher('#navTab').show(1);
          window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        }, 0);
			} else if (event.step === 'category') {
				this.selectedCategory = event.name;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(2);
          window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        }, 0);
			}
		}

	}

	checkDisabledTabs() {

    if (this.diagramSettings) {
			if (this.view.get('profile')?.value && this.category.get('diagram')?.get('type')?.value) {
				this.hasDataAndDiagramType = true;
			} else {
				this.hasDataAndDiagramType = false;
			}
		}

	}

	newViewSelected(): void {
		this.resetForm();
		// this.updateDefaultFormGroupValues();
		// this.diagramSettings.updateValueAndValidity();

		this.selectedCategory = '';
		this.selectedDataseries = '';
		// this.selectedAppearance = '';
	}

	resetForm(): void {

    this.diagramSettings.setControl('category', this.formFactory.createCategoryGroup());
    this.diagramSettings.setControl('dataseries', this.formFactory.createDataseriesGroupArray());
    this.diagramSettings.setControl('appearance', this.formFactory.createAppearanceGroup());

	}

  updateFormFile() {
    try {
      console.log('📁 UpdateFormFile - START');
      console.log('📁 Load form object:', this.dynamicFormHandlingService.loadFormObject);

      // this.diagramSettings = this.formFactory.createForm();
      // this.setFormObservers();
      this.clearData();

      console.log('📁 Form created, about to adjust and patch');
      this.dynamicFormHandlingService.adjustAndPatchForm(this.diagramSettings);

      setTimeout(() => {
        console.log('📁 About to patchValue with:', this.dynamicFormHandlingService.loadFormObject);
        this.diagramSettings.patchValue(this.dynamicFormHandlingService.loadFormObject, { emitEvent: false });

        this.dynamicFormHandlingService.formSchemaObject = this.diagramSettings.value;
        this.dynamicFormHandlingService.updateFromFile = false;
      }, 0);

      this.updateStepper({
        name: this.diagramSettings?.get('category')?.get('diagram')?.get('type')?.value,
        step: "category"
      });

    } catch (error) {
      console.error('❌ Error processing loaded JSON form data:', error);
    }
  }

	submitData() {
		console.log("SUBMIT this form:", this.diagramSettings.value);

    this.hasChanges = false;

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
    this.diagramSettings = this.formFactory.createForm();
    this.setFormObservers();

    this.updateStepper({
      name: null,
      step: 'view'
    });
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
