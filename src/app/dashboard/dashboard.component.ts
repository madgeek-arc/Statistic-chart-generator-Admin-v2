import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { FormFactoryService } from "../services/form-factory-service/form-factory-service";
import { MappingProfilesService } from "../services/mapping-profiles-service/mapping-profiles.service";
import { ChartInfo } from "../services/nl-chat-service/nl-chat.service";
import UIkit from 'uikit';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less',
  standalone: false
})

export class DashboardComponent implements OnInit {
	private destroyRef = inject(DestroyRef);
  private profileService = inject(MappingProfilesService);
  private formFactory = inject(FormFactoryService);
  private dynamicFormHandlingService = inject(DynamicFormHandlingService);
  protected chartExportingService = inject(ChartExportingService);

  nlQuery = signal<boolean>(false);

	diagramSettings: FormGroup;

	viewSelectionLabel: string = "View";
	categorySelectionLabel: string = "Chart type";
	configureDatasieriesLabel: string = "Data";
	customiseAppearanceLabel: string = "Appearance";

	open = true;
	hasDataAndDiagramType: boolean = false;

  frameHeight: number;
  hasChanges: boolean = false;

  chartInfo: ChartInfo[] | null = null;
  activeTab = signal('builder');

	ngOnInit(): void {

    this.frameHeight = (3 * window.outerHeight) / 5;
    this.clearData();

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
        this.resetForm();
      }

      // this.checkDisabledTabs();
    });

    this.diagramSettings.get('view.profile')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((profile: string) => {
      this.profileService.changeSelectedProfile(profile);
    });

    this.diagramSettings.get('category')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((diagram: any) => {
      this.checkDisabledTabs();
    });

    this.diagramSettings.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.dynamicFormHandlingService.formSchemaObject = value;
      this.hasChanges = true;
    });
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
				// this.selectedCategory = event.name;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(2);
          window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        }, 0);
			}
		}

	}

	checkDisabledTabs() {
    this.hasDataAndDiagramType = !!(this.view.get('profile')?.value && this.category.get('diagram')?.get('type')?.value);
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

      this.clearData();

      setTimeout(() => {
        console.log('📁 Form created, about to adjust and patch');
        this.dynamicFormHandlingService.adjustAndPatchFormWithValidators(this.diagramSettings);

        console.log('📁 About to patchValue with:', this.dynamicFormHandlingService.loadFormObject);
        this.diagramSettings.patchValue(this.dynamicFormHandlingService.loadFormObject, { emitEvent: false });
        // Update the selected profile in the mapping profiles service.
        this.profileService.changeSelectedProfile(this.diagramSettings.get('view.profile')?.value);

        this.dynamicFormHandlingService.formSchemaObject = this.diagramSettings.value;
        this.dynamicFormHandlingService.updateFromFile = false;

        this.checkDisabledTabs(); // Ensure check happens after value is patched in form.
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
    if (this.nlQuery()) {
      this.dynamicFormHandlingService.submitNLQuery(this.chartInfo);
      return;
    }

		this.dynamicFormHandlingService.submitForm();

	}

	clearData() {
    // Reset the form to its initial state.
    this.diagramSettings = this.formFactory.createForm();
    this.setFormObservers();
    this.nlQuery.set(false);
    this.chartInfo = null;

    // Reset chart, table, rawChartData, rawData objects.
    this.chartExportingService.clearChartUrls();

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

	/**
	 * Handles the completion of the AI chat session.
	 * @param result - The result of the chat session.
	 */
  onChatComplete(result: ChartInfo[]): void {
    if (result) {
      console.log('AI Chat completed with result:', result);
      this.chartInfo = result;
      this.nlQuery.set(true);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
