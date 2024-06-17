import { CdkStepper } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Profile } from '../services/profile-provider/profile-provider.service';
import { SCGAFormSchema } from './customise-appearance/visualisation-options/chart-form-schema.classes';
import { BehaviorSubject, first, forkJoin } from 'rxjs';
import { DiagramCategoryService } from './customise-appearance/visualisation-options/diagram-category-service/diagram-category.service';
import { DiagramCreator } from './dynamic-form-handling-diagram-creator';
import { HighChartsChart } from './customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model';
import { GoogleChartsChart, GoogleChartsTable } from './customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model';
import { HighMapsMap } from './customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model';
import { EChartsChart } from './customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model';
import { RawChartDataModel } from './customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model';
import { RawDataModel } from './customise-appearance/visualisation-options/supported-libraries-service/description-rawData.model';
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { ChartLoadingService } from '../services/chart-loading-service/chart-loading.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
	@ViewChild('stepper') stepper !: MatStepper;

	formGroup: FormGroup;

	firstTime: boolean = true;

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


	private _chartObject = new Object();
	private _tableObject = new Object();
	private _rawChartDataObject = new Object();
	private _rawDataObject = new Object();
	private _formSchemaObject: BehaviorSubject<SCGAFormSchema>;
	private _resetFormValue = null;
	private _formErrorObject: BehaviorSubject<Array<any>> = null as any;
	private _xAxisRequired: boolean = false;
	private _loadFormObject: Object;
	private _loadFormObjectFile: File = null as any;

	private _diagramCreator: DiagramCreator;



	constructor(
		private formBuilder: FormBuilder,
		private diagramcategoryService: DiagramCategoryService,
		private chartExportingService: ChartExportingService,
		private chartLoadingService: ChartLoadingService
	) {
		this._formSchemaObject = new BehaviorSubject(null as any);
		this._formErrorObject = new BehaviorSubject([] as any);

		this.createDefaultFormGroup();
	}

	set formSchemaObject(value: SCGAFormSchema) { this._formSchemaObject.next(value); }
	get formSchemaObject(): SCGAFormSchema { return this._formSchemaObject.getValue(); }
	get diagramCreator(): DiagramCreator { return this.diagramCreator; }
	get $formErrorObject(): BehaviorSubject<Array<any>> { return this._formErrorObject; }
	get ChartObject(): Object { return this._chartObject; }
	get TableObject(): Object { return this._tableObject; }
	get RawChartDataObject(): Object { return this._rawChartDataObject; }
	get RawDataObject(): Object { return this._rawDataObject; }
	get loadFormObject(): Object { return this._loadFormObject; }
	get loadFormObjectFile(): File { return this._loadFormObjectFile; }
	get isxAxisRequired(): boolean { return this._xAxisRequired; }

	set resetFormValue(value: SCGAFormSchema) { this._resetFormValue = value as any; }
	get isFormValid(): boolean {
		if (this.$formErrorObject.value === null) {
			return true;
		} else if (!this._xAxisRequired && this.isOnlyxAxisRequirementError()) {
			return true;
		} else {
			return false;
		}
		// return this.$formErrorObject.value === null;
	}

	// resetForm(root: FormProperty) {
	// 	// Reset through the root property of the dynamic form
	// 	root.reset(this._resetFormValue, false);

	// 	// Reset table and chart objects
	// 	this._chartObject = new Object();
	// 	this.chartExportingService.changeChartUrl(this._chartObject);

	// 	this._tableObject = new Object();
	// 	this.chartExportingService.changeTableUrl(this._tableObject);

	// 	this._rawChartDataObject = new Object();
	// 	this.chartExportingService.changeRawChartDataUrl(this._rawChartDataObject);

	// 	this._rawDataObject = new Object();
	// 	this.chartExportingService.changeRawDataUrl(this._rawDataObject);
	// }

	loadForm(event: any) {
		// console.log('Load Event', event);
		this._loadFormObjectFile = null as any;

		if (!(event === null || event === undefined)) {
			const fr: FileReader = new FileReader();

			fr.onload = () => this._loadFormObject = JSON.parse(<string>fr.result)
			fr.onloadstart = () => this.chartLoadingService.chartLoadingStatus = true
			fr.onloadend = () => this._loadFormObjectFile = event.target.files[0]

			fr.readAsText(event.target.files[0]);
		}
	}

	resetLoadForm() {
		this._loadFormObjectFile = null as any;
		this.chartLoadingService.isChartLoaded = false;
	}



	ngOnInit(): void {
		this.profile.valueChanges.subscribe((profile: Profile) => {
			if (profile && !this.firstTime) {
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
		this.firstTime = false;
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

		this.updateDefaultFormGroupValues();
		this.formGroup.updateValueAndValidity();

		this.selectedCategory = '';
		this.selectedDataseries = '';
		this.selectedAppearance = '';
	}

	createDefaultFormGroup(): void {
		this.formGroup = this.formBuilder.group({
			profile: this.formBuilder.control(null, Validators.required),
			category: this.formBuilder.control(null, Validators.required),
			dataseries: this.formBuilder.group({
				entity: this.formBuilder.control(null, Validators.required),
				aggregate: this.formBuilder.control(null, Validators.required),
				entityField: this.formBuilder.control(null, Validators.required),
				stackedData: this.formBuilder.control(null)
			}),
			appearance: this.formBuilder.group({
				chartAppearance: this.formBuilder.group({
					generalOptions: this.formBuilder.group({
						visualisationLibrary: this.formBuilder.control("highCharts", Validators.required),
						resultsLimit: this.formBuilder.control(30 as number, [Validators.required, Validators.min(1)]),
						orderBy: this.formBuilder.control(null, Validators.required),
					}),
					visualisationOptions: this.formBuilder.group({
						highCharts: this.formBuilder.group({
							title: this.formBuilder.group({
								titleText: this.formBuilder.control(null),
								titleColor: this.formBuilder.control("#333333"),
								horizontalAlignment: this.formBuilder.control('center'),
								margin: this.formBuilder.control(15),
								fontSize: this.formBuilder.control(18)
							}),
							subtitle: this.formBuilder.group({
								subtitleText: this.formBuilder.control(null),
								subtitleColor: this.formBuilder.control("#666666"),
								horizontalAlignment: this.formBuilder.control('center'),
								fontSize: this.formBuilder.control(12)
							}),
							xAxis: this.formBuilder.group({
								xAxisName: this.formBuilder.control(null),
								fontSize: this.formBuilder.control(11),
								color: this.formBuilder.control("#666666")
							}),
							yAxis: this.formBuilder.group({
								yAxisName: this.formBuilder.control(null),
								fontSize: this.formBuilder.control(11),
								color: this.formBuilder.control("#666666")
							}),
							miscOptions: this.formBuilder.group({
								enableExporting: this.formBuilder.control(true),
								stackedGraph: this.formBuilder.control('disabled'),
							}),
							chartArea: this.formBuilder.group({
								backgroundColor: this.formBuilder.control(null),
								borderColor: this.formBuilder.control("#335cad")
							})
						})
					})
				}),
				tableAppearance: this.formBuilder.group({
					tablePageSize: this.formBuilder.control(30 as number, [Validators.required, Validators.min(1)])
				}),
			})
		})
	}

	updateDefaultFormGroupValues(): void {
		this.appearance.get('tableAppearance')?.get('tablePageSize')?.setValue(30);
		this.appearance.get('chartAppearance')?.get('generalOptions')?.get('visualisationLibrary')?.setValue("highCharts");
		this.appearance.get('chartAppearance')?.get('generalOptions')?.get('resultsLimit')?.setValue(30);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('chartArea')?.get('borderColor')?.setValue("#335cad");
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('titleColor')?.setValue('#333333');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('horizontalAlignment')?.setValue('center');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('margin')?.setValue(15);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('title')?.get('fontSize')?.setValue(18);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('subtitle')?.get('subtitleColor')?.setValue('#666666');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('subtitle')?.get('horizontalAlignment')?.setValue('center');
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('xAxis')?.get('fontSize')?.setValue(11);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('xAxis')?.get('xAxisColor')?.setValue("#666666");
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('yAxis')?.get('fontSize')?.setValue(11);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('yAxis')?.get('yAxisColor')?.setValue("#666666");
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('miscOptions')?.get('enableExporting')?.setValue(true);
		this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.get('miscOptions')?.get('enableExporting')?.setValue('disabled');

	}

	isOnlyxAxisRequirementError() {

		for (const value of this._formErrorObject.getValue())
			if (value.code !== 'ARRAY_LENGTH_SHORT' || !value.path.endsWith('/data/xaxisData'))
				return false;

		return true;
	}

	private changeDataObjects(chartObject: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart,
		tableObject: GoogleChartsTable, rawChartDataObject: RawChartDataModel, rawDataObject: RawDataModel) {
		this._chartObject = chartObject;
		this.chartExportingService.changeChartUrl(chartObject);

		this._tableObject = tableObject;
		this.chartExportingService.changeTableUrl(tableObject);

		this._rawChartDataObject = rawChartDataObject;
		this.chartExportingService.changeRawChartDataUrl(rawChartDataObject);

		this._rawDataObject = rawDataObject;
		this.chartExportingService.changeRawDataUrl(rawDataObject);
	}


	testLog() {
		console.log("TESTING formGroup:", this.formGroup.value);
	}

	submitTest() {
		console.log("SUBMIT:", this.formGroup.value);

		let visualisationOptions = this.appearance.get('chartAppearance')?.get('visualisationOptions')?.get('highCharts')?.value;

		console.log("visualisationOptions:", visualisationOptions);

		// if (this.formSchemaObject !== null && this.isFormValid)
			this.createDataObjectsFromSchemaObject(this.formSchemaObject);

	}

	private createDataObjectsFromSchemaObject(value: SCGAFormSchema) {

		console.log("DATA POINT 2:", value);

		if (this.diagramcategoryService.selectedDiagramCategory$.value?.type === "numbers") {
			this._diagramCreator.createRawData(value).pipe(first()).subscribe(rawDataObject => {
				console.log("DATA POINT 3:", rawDataObject);

				return this.changeDataObjects(null as any, null as any, null as any, rawDataObject)

			})
			return;
		}

		forkJoin([this._diagramCreator.createChart(value), this._diagramCreator.createTable(value),
		this._diagramCreator.createRawChartData(value), this._diagramCreator.createRawData(value)])
			.pipe(first())
			.subscribe(([chartObject, tableObject, rawChartDataObject, rawDataObject]) => {

				console.log("DATA POINT 4:", [chartObject, tableObject, rawChartDataObject, rawDataObject]);
				// return;

				if(chartObject && tableObject && rawChartDataObject && rawDataObject) {
					return this.changeDataObjects(chartObject, tableObject, rawChartDataObject, rawDataObject)
				}
				return;
			});
		return;
	}



}
