import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { FormFactoryService } from "../services/form-factory-service/form-factory-service";
import { MappingProfilesService } from "../services/mapping-profiles-service/mapping-profiles.service";
import { ChartInfo, OptionsData } from "../services/nl-chat-service/nl-chat.service";
import { Profile } from '../services/profile-provider/profile-provider.service';
import { ISupportedCategory } from '../services/supported-chart-types-service/supported-chart-types.service';
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

  activeTab = signal('builder');
  activeAppearanceTab = signal('builder');
  nlQuery = signal<boolean>(false);
  nlAppearance = signal<boolean>(false);
  currentStep = 0;
  selectedProfileDetails: Profile | null = null;
  selectedChartDetails: ISupportedCategory | null = null;

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
  appearanceFromChat: OptionsData | null = null;

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

    this.diagramSettings.get('category')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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

	get dataseries() {
		return this.diagramSettings.get('dataseries') as FormArray;
	}

	get appearance() {
		return this.diagramSettings.get('appearance') as FormGroup;
	}

  private scrollLeftColumnToTop(): void {
    const el = document.querySelector('.left-column .scrollable') as HTMLElement | null;
    if (el) el.scrollTop = 0;
  }

	updateStepper(event: any): void {
		// this.diagramSettings.updateValueAndValidity();
    this.checkDisabledTabs();

		if (event) {
      if (event.step === 'view') {
        this.currentStep = 0;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(0);
          this.scrollLeftColumnToTop();
        }, 0);
      } else if (event.step === 'profile') {
        this.currentStep = 1;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(1);
          this.scrollLeftColumnToTop();
        }, 0);
      } else if (event.step === 'category') {
        this.currentStep = 2;
        setTimeout(() => {
          UIkit.switcher('#navTab').show(2);
          this.scrollLeftColumnToTop();
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
    if (this.nlQuery() || this.nlAppearance()) {
      this.dynamicFormHandlingService.submitNLQuery(this.chartInfo, this.appearanceFromChat);
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
    this.nlAppearance.set(false);
    this.appearanceFromChat = null;
    this.selectedChartDetails = null;

    // Reset chart, table, rawChartData, rawData objects.
    this.chartExportingService.clearChartUrls();

    this.updateStepper({
      name: null,
      step: 'view'
    });
	}

  onNavClick(event: Event, step: number): void {
    this.checkDisabledTabs();
    if ((step === 2 || step === 3) && !this.hasDataAndDiagramType) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.currentStep = step;
    setTimeout(() => this.scrollLeftColumnToTop(), 0);
  }

  backToView(): void {
    this.selectedChartDetails = null;
    this.updateStepper({ step: 'view' });
  }

  continueFromChartType(): void {
    if (!this.selectedChartDetails) return;
    this.updateStepper({ name: this.selectedChartDetails.name, step: 'category' });
  }

  continueFromView(): void {
    if (!this.selectedProfileDetails) return;
    this.profile.setValue(this.selectedProfileDetails.name);
    this.updateStepper({ name: this.selectedProfileDetails.name, step: 'profile' });
  }

  private readonly chartMetaMap: Record<string, { bestFor: string; tags: string[]; tips: { type: 'check' | 'info'; text: string }[] }> = {
    column:  { bestFor: 'Compare values across a few categories', tags: ['categorical', 'comparison'], tips: [{ type: 'check', text: 'Works well with 3 series' }, { type: 'info', text: 'Group by a categorical or time field on the X axis' }] },
    bar:     { bestFor: 'Horizontal comparison across categories', tags: ['categorical', 'comparison'], tips: [{ type: 'check', text: 'Great for long category labels' }, { type: 'info', text: 'Sort by value for easier reading' }] },
    line:    { bestFor: 'Show trends over time', tags: ['time-series', 'trend'], tips: [{ type: 'check', text: 'Works well with continuous data' }, { type: 'info', text: 'Use a date/time field on the X axis' }] },
    area:    { bestFor: 'Emphasise totals and trends over time', tags: ['time-series', 'trend'], tips: [{ type: 'check', text: 'Good for showing cumulative values' }, { type: 'info', text: 'Stack multiple series to show composition' }] },
    pie:     { bestFor: 'Show parts of a whole', tags: ['proportion', 'composition'], tips: [{ type: 'check', text: 'Best with fewer than 6 slices' }, { type: 'info', text: 'Values must sum to a meaningful total' }] },
    donut:   { bestFor: 'Parts of a whole with a central label', tags: ['proportion', 'composition'], tips: [{ type: 'check', text: 'Use the centre to highlight the total' }, { type: 'info', text: 'Keep slice count low for clarity' }] },
    scatter: { bestFor: 'Explore relationships between two numeric values', tags: ['correlation', 'distribution'], tips: [{ type: 'check', text: 'Works best with many data points' }, { type: 'info', text: 'Add a size dimension for bubble charts' }] },
    table:   { bestFor: 'Display raw sortable rows of data', tags: ['tabular', 'detail'], tips: [{ type: 'check', text: 'Supports sorting and filtering' }, { type: 'info', text: 'Best when exact values matter' }] },
    kpi:     { bestFor: 'Highlight a single important number', tags: ['metric', 'summary'], tips: [{ type: 'check', text: 'Ideal for dashboards and overviews' }, { type: 'info', text: 'Pair with a trend indicator for context' }] },
    map:     { bestFor: 'Show geographic distribution across regions', tags: ['geographic', 'spatial'], tips: [{ type: 'check', text: 'Requires a region or country dimension' }, { type: 'info', text: 'Use colour intensity to encode values' }] },
  };

  protected getChartMeta(type: string | undefined) {
    if (!type) return null;
    return this.chartMetaMap[type.toLowerCase()] ?? null;
  }

  protected getAvatarText(name: string): string {
    return name.split(/[\s_-]+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  protected getAvatarColor(name: string): string {
    const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
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
  onQueryComplete(result: ChartInfo[]): void {
    if (result) {
      console.log('AI Chat completed with result: ', result);
      this.chartInfo = result;
      this.nlQuery.set(true);
    }
  }

  onOptionsComplete(result: OptionsData) {
    if (result) {
      console.log('AI Chat completed with options: ', result);
      this.appearanceFromChat = result;
      this.nlAppearance.set(true);
    }
  }

  setActiveTab(tab: string, step?: string) {
    if (step === 'appearance') {
      this.activeAppearanceTab.set(tab)
      return;
    }
    this.activeTab.set(tab);
  }
}
