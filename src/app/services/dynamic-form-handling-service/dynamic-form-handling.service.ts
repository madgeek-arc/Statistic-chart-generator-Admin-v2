import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { DiagramCreator } from './dynamic-form-handling-diagram-creator';
import { ChartExportingService } from '../chart-exporting-service/chart-exporting.service';
import { ChartLoadingService } from '../chart-loading-service/chart-loading.service';
import { first } from 'rxjs/operators';
import {
	DiagramCategoryService
} from "../../dashboard/customise-appearance/visualisation-options/diagram-category-service/diagram-category.service";
import { SCGAFormSchema } from "../../dashboard/customise-appearance/visualisation-options/chart-form-schema.classes";
import {
	HighChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model";
import {
	GoogleChartsChart, GoogleChartsTable
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model";
import {
	HighMapsMap
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model";
import {
	EChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model";
import {
	RawChartDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model";
import {
	RawDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/description-rawData.model";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { FormFactoryService } from "../form-factory-service/form-factory-service";

@Injectable({
	providedIn: 'root'
})
export class DynamicFormHandlingService {

	private _chartObject: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null = null;
	private _tableObject: GoogleChartsTable | null = null;
	private _rawChartDataObject: RawChartDataModel | null = null;
	private _rawDataObject: RawDataModel | null = null;
	private _formSchemaObject: BehaviorSubject<SCGAFormSchema | null> = new BehaviorSubject<SCGAFormSchema | null>(null);
	private _formErrorObject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private _loadFormObject: Object;
	private _loadFormObjectFile: File | null = null;
	private updateFormFromFile = new BehaviorSubject(false);
	jsonLoaded = this.updateFormFromFile.asObservable();

	private _diagramCreator: DiagramCreator;

	// fixme when find another solution
	private _xAxisRequired: boolean = false;

	constructor(
    private diagramcategoryService: DiagramCategoryService,
		private chartExportingService: ChartExportingService,
		private chartLoadingService: ChartLoadingService,
    private formFactoryService: FormFactoryService) {

		this._diagramCreator = new DiagramCreator(diagramcategoryService);

	}

	get isFormValid(): boolean {
		// if (this.$formErrorObject.value === null) {
		// 	return true;
		// } else if (!this._xAxisRequired && this.isOnlyxAxisRequirementError()) {
		// 	return true;
		// } else {
		// 	return false;
		// }
		return this.formFactoryService.getFormRoot()?.valid || false;
	}

	set formSchemaObject(value: SCGAFormSchema) { this._formSchemaObject.next(value); }

  set updateFromFile(value: boolean) { this.updateFormFromFile.next(value); }

	get formSchemaObject(): SCGAFormSchema | null { return this._formSchemaObject.getValue(); }

	get $formErrorObject(): BehaviorSubject<Array<any>> { return this._formErrorObject; }

	get ChartObject(): HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null { return this._chartObject; }

	get TableObject(): GoogleChartsTable | null { return this._tableObject; }

	get RawChartDataObject(): RawChartDataModel | null { return this._rawChartDataObject; }

	get RawDataObject(): RawDataModel | null { return this._rawDataObject; }

	get loadFormObject(): Object { return this._loadFormObject; }

	get loadFormObjectFile(): File | null { return this._loadFormObjectFile; }

	get isxAxisRequired(): boolean { return this._xAxisRequired; }

	loadForm(event: any) {
		// console.log('Load Event', event);
		this._loadFormObjectFile = null;

		if (!(event === null || event === undefined)) {
			const fr: FileReader = new FileReader();

			fr.onload = () => {
				this._loadFormObject = JSON.parse(<string>fr.result);
				this.updateFormFromFile.next(true);
			}
			fr.onloadstart = () => this.chartLoadingService.chartLoadingStatus = true;
			fr.onloadend = () => this._loadFormObjectFile = event.target.files[0];


			fr.readAsText(event.target.files[0]);
		}
	}

	resetLoadForm() {
		this._loadFormObjectFile = null;
		this.chartLoadingService.isChartLoaded = false;
	}

  adjustAndPatchFormWithValidators(form: AbstractControl, json: any = this._loadFormObject): void {
    if (form instanceof FormGroup) {
      Object.keys(json).forEach(key => {
        if (!form.get(key)) {
          // Use form factory to create controls with proper validators
          const newControl = this.createControlWithValidators(key, json[key], form);
          if (newControl) {
            form.addControl(key, newControl);
          } else {
            // Fallback to basic control creation
            form.addControl(key, this.createControl(json[key]));
          }
        }

        const control = form.get(key);
        if (control) {
          this.adjustAndPatchFormWithValidators(control, json[key]);
        }
      });
    } else if (form instanceof FormArray) {
      while (form.length < json.length) {
        // For arrays, try to create controls with validators based on context
        const newControl = this.createArrayControlWithValidators(form, json[0]);
        form.push(newControl || this.createControl(json[0]));
      }
      while (form.length > json.length) {
        form.removeAt(form.length - 1);
      }
      json.forEach((item: any, index: number) => {
        this.adjustAndPatchFormWithValidators(form.at(index), item);
      });
    } else {
      form.setValue(json, { emitEvent: false });
    }
  }

  private createControlWithValidators(key: string, value: any, parentForm: AbstractControl): AbstractControl | null {
    // Determine the path to understand what validators to apply
    const formPath = this.getFormPath(parentForm);
    const fullPath = formPath ? `${formPath}.${key}` : key;

    console.log(`🔧 Creating control with validators for path: ${fullPath}`);

    // Handle specific form sections using form factory methods
    if (fullPath === 'category') {
      return this.formFactoryService.createCategoryGroup();
    } else if (fullPath === 'view') {
      return this.formFactoryService.createViewGroup(value?.profile || null);
    } else if (fullPath === 'dataseries') {
      return this.formFactoryService.createDataseriesGroupArray();
    } else if (fullPath === 'appearance') {
      return this.formFactoryService.createAppearanceGroup();
    } else if (fullPath.includes('dataseries') && key === 'data') {
      // For dataseries data groups, we need to create them with proper structure
      const dataseriesIndex = this.extractDataseriesIndex(fullPath);
      if (dataseriesIndex !== -1) {
        const dataseriesGroup = this.formFactoryService.createDataseriesGroup(dataseriesIndex, { data: value });
        return dataseriesGroup.get('data');
      }
    }

    return null;
  }

  private createArrayControlWithValidators(formArray: FormArray, value: any): AbstractControl | null {
    const formPath = this.getFormPath(formArray);

    console.log(`🔧 Creating array control with validators for path: ${formPath}`);

    if (formPath === 'dataseries') {
      const index = formArray.length;
      return this.formFactoryService.createDataseriesGroup(index, value);
    } else if (formPath?.includes('xaxisData')) {
      return this.formFactoryService.createXaxisEntityField(value);
    } else if (formPath?.includes('filters')) {
      return this.formFactoryService.createFilterGroup(value);
    } else if (formPath?.includes('groupFilters')) {
      return this.formFactoryService.createFilterRuleGroup(value);
    }

    return null;
  }

  private getFormPath(control: AbstractControl): string {
    // This is simplified path detection - you might need to enhance this
    // based on your form structure requirements
    let current = control;
    const path: string[] = [];

    // Walk up the form tree to build path - this is a basic implementation
    // You might need to enhance this based on your specific form structure
    while (current && (current as any).parent) {
      const parent = (current as any).parent;
      if (parent instanceof FormGroup) {
        const key = Object.keys(parent.controls).find(k => parent.controls[k] === current);
        if (key) {
          path.unshift(key);
        }
      } else if (parent instanceof FormArray) {
        const index = parent.controls.indexOf(current);
        if (index !== -1) {
          path.unshift(index.toString());
        }
      }
      current = parent;
    }

    return path.join('.');
  }

  private extractDataseriesIndex(path: string): number {
    const match = path.match(/dataseries\.(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  }

  adjustAndPatchForm(form: AbstractControl, json: any = this._loadFormObject): void {
		if (form instanceof FormGroup) {
			Object.keys(json).forEach(key => {
				if (!form.get(key)) {
					form.addControl(key, this.createControl(json[key])); // Add missing control
				}

				this.adjustAndPatchForm(form.get(key)!, json[key]); // Recurse

			});
		} else if (form instanceof FormArray) {

			while (form.length < json.length) {
				form.push(this.createControl(json[0])); // Add controls to match the array size
			}
			while (form.length > json.length) {
				form.removeAt(form.length - 1); // Remove extra controls (Unnecessary now that we reset the form before file upload)
			}
			json.forEach((item: any, index: number) => {
				this.adjustAndPatchForm(form.at(index), item); // Recurse
			});
		} else {
			form.setValue(json, { emitEvent: false }); // Set value for FormControl
		}
	}

	createControl(value: any): AbstractControl {
		if (value && typeof value === 'object' && !Array.isArray(value)) {
      // console.log("value:", value);
			const group = new FormGroup({});
			Object.keys(value).forEach(key => group.addControl(key, this.createControl(value[key])));
			return group;
		} else if (Array.isArray(value)) {
			const array = new FormArray<any>([]);
			// console.log("value:", value);

			value.forEach(item => array.push(this.createControl(item)));
			return array;
		} else {
      // console.log("value:", value);
			return new FormControl(value);
		}
	}

	public submitForm() {
		console.log('Submitted this form', this.formSchemaObject);

		if (this.formSchemaObject !== null && this.isFormValid)
			this.createDataObjectsFromSchemaObject(this.formSchemaObject);
	}

	private createDataObjectsFromSchemaObject(value: SCGAFormSchema) {

		if (this.diagramcategoryService.selectedDiagramCategory$.value?.type === "numbers") {
			this._diagramCreator.createRawData(value).pipe(first()).subscribe(rawDataObject => this.changeDataObjects(null, null, null, rawDataObject))
			return;
		}

		forkJoin([this._diagramCreator.createChart(value), this._diagramCreator.createTable(value),
		this._diagramCreator.createRawChartData(value), this._diagramCreator.createRawData(value)])
			.pipe(first())
			.subscribe(([chartObject, tableObject, rawChartDataObject, rawDataObject]) =>
				this.changeDataObjects(chartObject, tableObject, rawChartDataObject, rawDataObject));
	}

	public publishURLS() {
		console.log('Publish this form', this.formSchemaObject);

		if (!this.isFormValid)
			this.changeDataObjects(null, null, null, null);

		if (this.formSchemaObject !== null && this.isFormValid)
			this.createDataObjectsFromSchemaObject(this.formSchemaObject);
	}

	public exportForm() {
		this.createAndDownloadJSON(this.formSchemaObject, 'chart.json');
	}

	public createAndDownloadJSON(jsonObj: SCGAFormSchema | null, filename: string) {

		const element = document.createElement('a');
		element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj)));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();
		document.body.removeChild(element);
	}

	// changeRequirementOfXAxis(required: boolean) {
	//
	//   this._xAxisRequired = required;
	//
	//   if (this._xAxisRequired) {
	//     this._formSchema.dataseriesFormSchema.items.properties.data.fieldsets[0].fields = ['yaxisData', 'xaxisData'];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.required = ['yAxisData', 'xAxisData', 'filters'];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData.items.required = ['xaxisEntityField'];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData.minItems = 1;
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData
	//       .items.properties.xaxisEntityField.requiredField = true;
	//   } else {
	//     // this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData.widget = 'hidden';
	//     this._formSchema.dataseriesFormSchema.items.properties.data.fieldsets[0].fields = ['yaxisData'];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.required = ['yAxisData', 'filters'];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData.items.required = [];
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData.minItems = 0;
	//     this._formSchema.dataseriesFormSchema.items.properties.data.properties.xaxisData
	//       .items.properties.xaxisEntityField.requiredField = false;
	//   }
	// }

	// printLogs() {
	//   console.log('this._formSchema --> ', this._formSchema);
	//   console.log('this._formErrorObject -->', this._formErrorObject);
	// }

	isOnlyxAxisRequirementError() {

		for (const value of this._formErrorObject.getValue())
			if (value.code !== 'ARRAY_LENGTH_SHORT' || !value.path.endsWith('/data/xaxisData'))
				return false;

		return true;
	}

  private changeDataObjects(chartObject: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null,
                            tableObject: GoogleChartsTable | null,
                            rawChartDataObject: RawChartDataModel | null,
                            rawDataObject: RawDataModel | null) {

		this._chartObject = chartObject;
		this.chartExportingService.changeChartUrl(chartObject);

		this._tableObject = tableObject;
		this.chartExportingService.changeTableUrl(tableObject);

		this._rawChartDataObject = rawChartDataObject;
		this.chartExportingService.changeRawChartDataUrl(rawChartDataObject);

		this._rawDataObject = rawDataObject;
		this.chartExportingService.changeRawDataUrl(rawDataObject);
	}
}
