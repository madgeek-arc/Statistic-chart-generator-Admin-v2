import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  OnChanges,
  OnInit, QueryList,
  SimpleChanges,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ChartTableModalContext } from "../modals/chart-table-modal/chart-table-modal.component";
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UrlProviderService } from '../services/url-provider-service/url-provider.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { FormFactoryService } from "../services/form-factory-service/form-factory-service";
import UIkit from 'uikit';
import { SelectAttributeComponent } from "./helper-components/select-attribute/select-attribute.component";

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnChanges, AfterViewInit {
	private destroyRef = inject(DestroyRef);

  @ViewChildren(SelectAttributeComponent) selectAttributeComponents!: QueryList<SelectAttributeComponent>;
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

    this.diagramSettings = this.formFactory.createForm();

    this.dynamicFormHandlingService.jsonLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        // this.jsonLoad = data;
        if (data) {
          this.updateFormFile();
        }
      }
    });

    this.setFormObservers();
	}

  ngAfterViewInit() {
    // Subscribe to changes in select-attribute components
    this.selectAttributeComponents.changes.subscribe(() => {
      console.log('🔧 Select attribute components changed');
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

  updateFormFile() {
    try {
      console.log('📁 UpdateFormFile - START');
      console.log('📁 Load form object:', this.dynamicFormHandlingService.loadFormObject);

      this.diagramSettings = this.formFactory.createForm();
      this.setFormObservers();

      console.log('📁 Form created, about to adjust and patch');
      this.dynamicFormHandlingService.adjustAndPatchForm(this.diagramSettings);

      setTimeout(() => {
        console.log('📁 About to patchValue with:', this.dynamicFormHandlingService.loadFormObject);
        this.diagramSettings.patchValue(this.dynamicFormHandlingService.loadFormObject, { emitEvent: false });

        // Force update select-attribute components after patching
        this.forceUpdateSelectAttributes();

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

  private forceUpdateSelectAttributes() {
    console.log('🔧 Forcing select-attribute updates via ViewChildren');

    setTimeout(() => {
      const dataseries = this.diagramSettings.get('dataseries') as FormArray;

      // Use ViewChildren to directly access select-attribute components
      this.selectAttributeComponents.forEach((component, index) => {
        console.log(`🔧 Updating select-attribute component ${index}`);

        // Find the corresponding form control
        const seriesIndex = Math.floor(index / 3); // Assuming 3 select-attributes per series (Y, X, Filter)
        const ctrl = dataseries.at(seriesIndex);

        if (ctrl) {
          const entity = ctrl.get('data.yaxisData.entity')?.value;
          if (entity && component.control?.value) {
            // Force the component to re-render with its current value
            component.writeValue(component.control.value);
          }
        }
      });
    }, 100);
  }


  // private forceUpdateSelectAttributes() {
  //   console.log('🔧 Forcing select-attribute updates');
  //
  //   setTimeout(() => {
  //     const dataseries = this.diagramSettings.get('dataseries') as FormArray;
  //     dataseries.controls.forEach((ctrl, index) => {
  //       const entity = ctrl.get('data.yaxisData.entity')?.value;
  //
  //       // Force update Y-Axis field
  //       const yAxisField = ctrl.get('data.yaxisData.yaxisEntityField');
  //       if (entity && yAxisField) {
  //         console.log(`🔧 Forcing Y-Axis field update for series ${index}:`, yAxisField.value);
  //         // Trigger writeValue by setting the value again, even if it's the same
  //         const currentValue = yAxisField.value;
  //         yAxisField.setValue(null); // Clear first
  //         setTimeout(() => yAxisField.setValue(currentValue), 10); // Then set the actual value
  //       }
  //
  //       // Force update X-Axis fields
  //       const xAxisData = ctrl.get('data.xaxisData') as FormArray;
  //       xAxisData.controls.forEach((xCtrl, xIndex) => {
  //         const xAxisField = xCtrl.get('xaxisEntityField');
  //         if (entity && xAxisField) {
  //           console.log(`🔧 Forcing X-Axis field update for series ${index}.${xIndex}:`, xAxisField.value);
  //           const currentValue = xAxisField.value;
  //           xAxisField.setValue(null);
  //           setTimeout(() => xAxisField.setValue(currentValue), 10);
  //         }
  //       });
  //
  //       // Force update filter fields
  //       const filters = ctrl.get('data.filters') as FormArray;
  //       filters.controls.forEach((filterCtrl) => {
  //         const groupFilters = filterCtrl.get('groupFilters') as FormArray;
  //         groupFilters.controls.forEach((groupCtrl) => {
  //           const fieldCtrl = groupCtrl.get('field');
  //           if (entity && fieldCtrl) {
  //             const currentValue = fieldCtrl.value;
  //             fieldCtrl.setValue(null);
  //             setTimeout(() => fieldCtrl.setValue(currentValue), 10);
  //           }
  //         });
  //       });
  //     });
  //   }, 100);
  // }

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
