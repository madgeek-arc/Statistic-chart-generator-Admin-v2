import { Component, DestroyRef, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Profile } from '../services/profile-provider/profile-provider.service';
import { SCGAFormSchema } from './customise-appearance/visualisation-options/chart-form-schema.classes';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from "@angular/material/dialog";
import {
	ChartTableModalComponent,
	ChartTableModalContext
} from "../modals/chart-table-modal/chart-table-modal.component";
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import UIkit from 'uikit';
import { UrlProviderService } from '../services/url-provider-service/url-provider.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnChanges {
	private destroyRef = inject(DestroyRef);

	@ViewChild('stepper') stepper !: MatStepper;

	formGroup: FormGroup;

	firstTime: boolean = true;

	viewSelectionLabel: string = "View";
	selectedView: string = "";
	categorySelectionLabel: string = "Chart type";
	selectedCategory: string = "";
	configureDatasieriesLabel: string = "Data";
	selectedDataseries: string = "";
	customiseAppearanceLabel: string = "Appearance";
	selectedAppearance: string = '';

	iframeUrl: string = '';

	open = true;
	hasDataAndDiagramType: boolean = false;
	frameUrl: SafeResourceUrl;

	dialogData: ChartTableModalContext = {
		chartObj: this.dynamicFormHandlingService.ChartObject,
		tableObj: this.dynamicFormHandlingService.TableObject,
		rawChartDataObj: this.dynamicFormHandlingService.RawChartDataObject,
		rawDataObj: this.dynamicFormHandlingService.RawDataObject
	};

	private _formErrorObject: BehaviorSubject<Array<any>> = null as any;


	constructor(
		private formBuilder: FormBuilder,
		public dynamicFormHandlingService: DynamicFormHandlingService,
		public dialog: MatDialog,
		private urlProvider: UrlProviderService,
		private sanitizer: DomSanitizer,
		public chartExportingService: ChartExportingService
	) {
		this._formErrorObject = new BehaviorSubject([] as any);

		this.createDefaultFormGroup();

		this.frameUrl = this.getSanitizedFrameUrl(urlProvider.serviceURL + '/chart');
	}


	ngOnInit(): void {
		this.view.valueChanges.subscribe((profile: any) => {

			console.log("TESTING newViewSelected profile", profile)
			console.log("TESTING newViewSelected this.firstTime", this.firstTime)


			if (profile && !this.firstTime) {
				this.newViewSelected(profile);
			}
		});

		this.formGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
			this.dynamicFormHandlingService.formSchemaObject = value;
		});

		this.dynamicFormHandlingService.jsonLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: data => {
				if (data) {
					this.dynamicFormHandlingService.adjustAndPatchForm(this.formGroup);
					console.log(this.formGroup.value);
					this.formGroup.setValue(this.dynamicFormHandlingService.loadFormObject)

				}
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
		return this.formGroup.get('testingView') as FormControl;
	}

	get view() {
		return this.formGroup.get('view') as FormGroup;
	}

	get profile() {
		return this.view.get('profile') as FormControl;
	}

	get category() {
		return this.formGroup.get('category') as FormGroup;
	}

	get categoryName() {
		return this.formGroup.get('category')?.get('diagram')?.get('name') as FormControl;
	}

	get dataseries() {
		return this.formGroup.get('dataseries') as FormArray;
	}

	get appearance() {
		return this.formGroup.get('appearance') as FormGroup;
	}

	onStepChange(event: any): void {
		console.log("onStepChange:", event.selectedIndex);
	}

	updateStepper(event: any): void {
		console.log("updateStepper EVENT:", event);
		console.log("updateStepper category:", this.category.value);

		this.formGroup.updateValueAndValidity();

		this.firstTime = false;
		if (event) {
			if (event.step === 'profile') {
				UIkit.switcher('#navTab').show(1);
			} else if (event.step === 'category') {
				this.selectedCategory = event.name;
				UIkit.switcher('#navTab').show(2);
			}
		}


		this.checkDisabledTabs();

		this.moveToNextStep()
	}

	checkDisabledTabs() {
		console.log("this.category.get('diagram')?.value", this.category.get('diagram')?.value);
		console.log("this.category.get('diagram')?.get('type')?.value", this.category.get('diagram')?.get('type')?.value);

		if (this.formGroup) {
			if (this.view.get('profile')?.value && this.category.get('diagram')?.get('type')?.value) {
				this.hasDataAndDiagramType = true;
			} else {
				this.hasDataAndDiagramType = false;
			}
		}
	}

	moveToNextStep(): void {
		setTimeout(() => {
			this.formGroup.updateValueAndValidity();
			window.scroll(0, 0);
		}, 1);
	}

	newViewSelected(profile: any): void {
		this.category.reset();
		this.dataseries.reset();
		// this.appearance.reset();

		this.createDefaultFormGroup(profile);
		this.updateDefaultFormGroupValues();
		this.formGroup.updateValueAndValidity();

		this.selectedCategory = '';
		this.selectedDataseries = '';
		// this.selectedAppearance = '';
	}

	createDefaultFormGroup(profile?: any): void {
		this.formGroup = this.formBuilder.group({
			testingView: this.formBuilder.control(this.formGroup ? this.formGroup.get('testingView')?.value : null),
			view: this.formBuilder.group({
				profile: this.formBuilder.control((profile?.profile !== null && profile?.profile !== undefined) ? profile.profile : null)
			}),
			category: this.formBuilder.group(this.formGroup ? this.category.value : {
				diagram: this.formBuilder.group({
					type: new FormControl<string | null>(null),
					supportedLibraries: new FormArray([]),
					name: new FormControl<string | null>(null),
					diagramId: new FormControl<number | null>(null),
					description: new FormControl<string | null>(null),
					imageURL: new FormControl<string | null>(null),
					isPolar: new FormControl<string | null>(null),
					isHidden: new FormControl<string | null>(null)
				})
			}),
			dataseries: new FormArray([
				new FormGroup({
					data: new FormGroup({
						yaxisData: new FormGroup({
							entity: new FormControl<string | null>(null, Validators.required),
							yaxisAggregate: new FormControl<string | null>(null, Validators.required),
							yaxisEntityField: new FormGroup({
								name: new FormControl<string | null>(null),
								type: new FormControl<string | null>(null)
							}),
						}),
						xaxisData: new FormArray([
							new FormGroup({
								xaxisEntityField: new FormGroup({
									name: new FormControl<string | null>(null),
									type: new FormControl<string | null>(null)
								})
							})
						]),
						filters: new FormArray([])
					}),
					chartProperties: new FormGroup({
						chartType: new FormControl<string | null>(null),
						dataseriesColor: new FormControl<string | null>(null),
						dataseriesName: new FormControl<string | null>({ value: 'Data', disabled: true }),
						stacking: new FormControl<'null' | 'normal' | 'percent' | 'stream' | 'overlap'>('null', Validators.required),
					}),
				})
			]),
			appearance: this.formBuilder.group({
				chartAppearance: this.formBuilder.group({
					generalOptions: this.formBuilder.group({
						visualisationLibrary: this.formBuilder.control('HighCharts', Validators.required),
						resultsLimit: this.formBuilder.control(30 as number, [Validators.required, Validators.min(1)]),
						orderByAxis: this.formBuilder.control(null),
					}),
					visualisationOptions: this.formBuilder.group({
						highchartsAppearanceOptions: this.formBuilder.group({
							title: this.formBuilder.group({
								titleText: this.formBuilder.control<string>(''),
								color: this.formBuilder.control<string>('#333333'),
								align: this.formBuilder.control<'right' | 'center' | 'left'>('center'),
								margin: this.formBuilder.control<number>(15),
								fontSize: this.formBuilder.control<number>(18)
							}),
							subtitle: this.formBuilder.group({
								text: this.formBuilder.control(null),
								color: this.formBuilder.control('#666666'),
								horizontalAlignment: this.formBuilder.control('center'),
								fontSize: this.formBuilder.control(12)
							}),
							xAxis: this.formBuilder.group({
								name: this.formBuilder.control(null),
								fontSize: this.formBuilder.control(11),
								color: this.formBuilder.control('#666666')
							}),
							yAxis: this.formBuilder.group({
								name: this.formBuilder.control(null),
								fontSize: this.formBuilder.control(11),
								color: this.formBuilder.control('#666666')
							}),
							miscOptions: this.formBuilder.group({
								enableExporting: this.formBuilder.control(true),
								enableDrilldown: this.formBuilder.control(false),
								stackedGraph: this.formBuilder.control('disabled'),
							}),
							chartArea: this.formBuilder.group({
								backgroundColor: this.formBuilder.control(null),
								borderColor: this.formBuilder.control('#335cad'),
								borderCornerRadius: this.formBuilder.control(0),
								borderWidth: this.formBuilder.control(0)
							}),
							plotArea: this.formBuilder.group({
								backgroundColor: this.formBuilder.control('#ffffff'),
								borderColor: this.formBuilder.control('#cccccc'),
								backgroundImageUrl: this.formBuilder.control(''),
								borderWidth: this.formBuilder.control(0)
							}),
							dataLabels: this.formBuilder.group({
								enableData: this.formBuilder.control(false)
							}),
							credits: this.formBuilder.group({
								enableCredits: this.formBuilder.control(false)
							}),
							legend: this.formBuilder.group({
								enableLegend: this.formBuilder.control(true),
								itemlayout: this.formBuilder.control('horizontal'),
								horizontalAlignment: this.formBuilder.control('center'),
								verticalAlignment: this.formBuilder.control('bottom')
							}),
							zoomOptions: this.formBuilder.group({
								enableXAxisZoom: this.formBuilder.control(false),
								enableYAxisZoom: this.formBuilder.control(false)
							}),
							dataSeriesColorPalette: this.formBuilder.array([])
						}),
						googlechartsAppearanceOptions: this.formBuilder.group({
							titles: this.formBuilder.group({
								title: this.formBuilder.control<string>(''),
								subtitle: this.formBuilder.control<string>('')
							}),
							axisNames: this.formBuilder.group({
								yaxisName: this.formBuilder.control<string>(''),
								xaxisName: this.formBuilder.control<string>('')
							}),
							exporting: this.formBuilder.control<boolean>(true),
							stackedChart: this.formBuilder.control<string>('disabled'),
							gcCABackGroundColor: this.formBuilder.control<string>('#ffffff'),
							gcPABackgroundColor: this.formBuilder.control<string>('#ffffff')
						}),
						echartsAppearanceOptions: this.formBuilder.group({
							titles: this.formBuilder.group({
								title: this.formBuilder.control<string>(''),
								subtitle: this.formBuilder.control<string>('')
							}),
							axisNames: this.formBuilder.group({
								yaxisName: this.formBuilder.control<string>(''),
								xaxisName: this.formBuilder.control<string>('')
							}),
							dataSeriesColorArray: this.formBuilder.array<string>([]),
							ecChartArea: this.formBuilder.group({
								ecCABackGroundColor: this.formBuilder.control<string>('#ffffff')
							}),
							ecLegend: this.formBuilder.group({
								ecEnableLegend: this.formBuilder.control<boolean>(true),
								ecLegendLayout: this.formBuilder.control<'horizontal' | 'vertical'>('horizontal'),
								ecLegendHorizontalAlignment: this.formBuilder.control<'left' | 'center' | 'right'>('center'),
								ecLegendVerticalAlignment: this.formBuilder.control<'top' | 'middle' | 'bottom'>('bottom')
							}),
							ecMiscOptions: this.formBuilder.group({
								exporting: this.formBuilder.control<boolean>(true),
								ecEnableDataLabels: this.formBuilder.control<boolean>(false),
								stackedChart: this.formBuilder.control<boolean>(false)
							}),
							ecZoomOptions: this.formBuilder.group({
								enableXaxisZoom: this.formBuilder.control<boolean>(false),
								enableYaxisZoom: this.formBuilder.control<boolean>(false)
							})
						})
					})
				}),
				tableAppearance: this.formBuilder.group({
					paginationSize: this.formBuilder.control(30 as number, [Validators.required, Validators.min(1)])
				}),
			})
		});

		this.formGroup.get('appearance')?.get('chartAppearance')?.get('visualisationOptions')?.get('googlechartsAppearanceOptions')?.disable();
		this.formGroup.get('appearance')?.get('chartAppearance')?.get('visualisationOptions')?.get('echartsAppearanceOptions')?.disable();
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

	isOnlyxAxisRequirementError() {
		for (const value of this._formErrorObject.getValue())
			if (value.code !== 'ARRAY_LENGTH_SHORT' || !value.path.endsWith('/data/xaxisData'))
				return false;

		return true;
	}

	submitData() {
		console.log("SUBMIT this form:", this.formGroup.value);

		this.dynamicFormHandlingService.submitForm();

		const data: ChartTableModalContext = {
			chartObj: this.dynamicFormHandlingService.ChartObject,
			tableObj: this.dynamicFormHandlingService.TableObject,
			rawChartDataObj: this.dynamicFormHandlingService.RawChartDataObject,
			rawDataObj: this.dynamicFormHandlingService.RawDataObject
		}

		this.dialogData = data;

		console.log("THIS IS THE DATA:", data);
		// this.openDialog(data);
	}

	clearData() {
		console.log("CLEAR ALL DATA!");
	}

	makeChangesToForm(form: any): SCGAFormSchema {
		// remove testingView for development purposes
		delete form.testingView;

		const tempDiagram = form['category'];
		form['category'] = {};
		form['category']['diagram'] = tempDiagram;


		// return form;
		// TODO change the way you control the dataseries because it will be a dynamic array (FormArray) and not one object
		// TODO check and see how dataseries works. ex where is the dataseries name: "Data" coming from
		const tempDataseries = form['dataseries'];
		form['dataseries'] = [];
		form['dataseries'][0] = {};
		form['dataseries'][0]['chartProperties'] = {};
		form['dataseries'][0]['chartProperties']['dataseriesName'] = "Data";
		form['dataseries'][0]['chartProperties']['stacking'] = tempDataseries.stackedData;
		form['dataseries'][0]['data'] = {};
		form['dataseries'][0]['data']['filters'] = tempDataseries.filters;
		// TODO add funcionality for array (FormArray) for xaxisData
		form['dataseries'][0]['data']['xaxisData'] = [];
		// TODO add funcionality for path creation
		form['dataseries'][0]['data']['xaxisData'] = [];
		form['dataseries'][0]['data']['xaxisData'][0] = {};
		form['dataseries'][0]['data']['xaxisData'][0]['xaxisEntityField'] = {};
		form['dataseries'][0]['data']['xaxisData'][0]['xaxisEntityField']['name'] = tempDataseries.entity + "." + tempDataseries.entityField;
		// TODO find out where the type is coming from or if we infer it
		form['dataseries'][0]['data']['xaxisData'][0]['xaxisEntityField']['type'] = "text";
		form['dataseries'][0]['data']['yaxisData'] = {};
		form['dataseries'][0]['data']['yaxisData']['entity'] = tempDataseries.entity;
		form['dataseries'][0]['data']['yaxisData']['yaxisAggregate'] = tempDataseries.aggregate;

		// form['dataseries'][0] = tempDataseries;



		console.log("TESTING FORM:", form);
		return form;
	}

	openDialog(data: ChartTableModalContext) {
		this.dialog.open(ChartTableModalComponent, {
			data: data,
			minWidth: '75svw',
			minHeight: '80svh'
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
