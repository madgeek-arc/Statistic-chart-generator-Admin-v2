import { AfterViewInit, Component, DestroyRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';
import { DbSchemaService } from "../../services/db-schema-service/db-schema.service";
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DynamicTreeDatabase } from "../../services/dynamic-tree-database/dynamic-tree-database.service";
import { distinctUntilChanged } from "rxjs/operators";
import UIkit from "uikit";

export enum FieldType { text, int, float, date};

export class FilterType {
  filterOperator: string;
  filterName: string;
  filterType: FieldType[];
}

@Component({
	selector: 'app-dataseries-selector',
	templateUrl: './dataseries-selector.component.html',
	styleUrls: ['./dataseries-selector.component.less'],
	providers: [FormGroupDirective]
})

export class DataseriesSelectorComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);

	@Input('selectedProfile') selectedProfile: FormControl = new FormControl();
	@ViewChild('editDataseriesName') editDataseriesName;

  form: FormArray<FormGroup> | null = null;

  entities: Array<string> = [];
  selectedTitleIndex = -1;
  selectedCategoryId: number | null = null;

	hasTwoEntityFields: boolean = false;
	dataseriesIncremment: number = 0;


  protected aggregates = [
    { label: 'Total', value: 'total' },
    { label: 'Count', value: 'count' },
    { label: 'Sum', value: 'sum' },
    { label: 'Minimum', value: 'min' },
    { label: 'Maximum', value: 'max' },
    { label: 'Average', value: 'avg' }
  ];

	protected stackedDataList = [
		{ label: 'Disabled', value: 'null' },
		{ label: 'Stacked by Value', value: 'normal' },
		{ label: 'Stacked by Percentage', value: 'percent' }
	];

	protected chartTypeList = [
		// { label: 'Disabled', value: 'null' },
    { label: 'Area', value: 'area' },
    { label: 'Bar', value: 'bar' },
    { label: 'Column', value: 'column' },
    { label: 'Line', value: 'line' },
		{ label: 'Pie', value: 'pie' },
		{ label: 'Treemap', value: 'treemap' },
		{ label: 'Dependency wheel', value: 'dependencywheel' },
		{ label: 'Sankey', value: 'sankey' }
	];

	protected filterOperators: FilterType[] = [
		{ filterOperator: '=', filterName: 'Equals', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '!=', filterName: 'Not equals', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '>', filterName: 'Greater than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '>=', filterName: 'Greater / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '<', filterName: 'Less than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '<=', filterName: 'Less / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: 'contains', filterName: 'Contains', filterType: [FieldType.text] },
		{ filterOperator: 'starts_with', filterName: 'Starts with', filterType: [FieldType.text] },
		{ filterOperator: 'ends_with', filterName: 'Ends with', filterType: [FieldType.text] }
	];

	constructor(
    private dynamicTreeDB: DynamicTreeDatabase,
		private dbService: DbSchemaService,
    private formFactory: FormFactoryService,
	) { }

	ngOnInit(): void {
		// With the change in stepper, the data is not created in the beginning, so it'll have to be initialized and not wait for "value changes"
    const profile = new Profile();

		if (this.selectedProfile && this.selectedProfile.value) {
      profile.name = this.selectedProfile.value;
      this.handleProfileChange(profile);
		}

		this.selectedProfile.valueChanges.subscribe((profileName: string) => {
			if (profileName) {
        profile.name = profileName;
        this.handleProfileChange(profile);
			}
		});

    this.form = this.formFactory.getFormRoot().get('dataseries') as FormArray;
    this.selectedCategoryId = this.formFactory.getFormRoot().get('category.diagram.diagramId').value;
    this.formFactory.getFormRoot().get('category.diagram.diagramId').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (diagramId: number) => {
        this.selectedCategoryId = diagramId;
      }
    });

	}

  ngAfterViewInit() {

    // Check if the form is patched after view init
    setTimeout(() => {
      console.log('🏁 DataSeries AfterViewInit - Form values:');
      this.form.controls.forEach((ctrl, index) => {
        const entity = ctrl.get('data.yaxisData.entity')?.value;
        const yField = ctrl.get('data.yaxisData.yaxisEntityField')?.value;
        console.log(`   Series ${index}: Entity=${entity}, YField=${JSON.stringify(yField)}`);
      });
    }, 100);
  }

  hide(element: any) {
    UIkit.dropdown(element).hide();
  }

  handleProfileChange(profile: Profile | null) {
    this.dynamicTreeDB.changeEntityMap(profile);

    this.dbService.getAvailableEntities(profile).pipe(distinctUntilChanged()).subscribe({
      next: (entities: Array<string>) => {
        this.entities = entities;
      }
    });
  }

	getXAxisData(form: any) {
		// console.log(form.controls.data.controls.xaxisData.controls[0].controls.xaxisEntityField);
		return form.controls.data.controls.xaxisData.controls;
	}

	getFilters(form: any) {
		// console.log(form.controls.data.controls.filters.controls);
		return form.controls.data.controls.filters.controls;
	}

	getGroups(form: any) {
		// console.log(form.controls.data.controls.filters.controls);
		return form.controls.groupFilters.controls;
	}

	addFilter(form: any) {
		form.controls.data.controls.filters.push(this.formFactory.createFilterGroup());
    this.addFilterRule(form.controls.data.controls.filters.controls[form.controls.data.controls.filters.controls.length - 1]);
  }

	removeFilter(form: any, index: number) {
		form.controls.data.controls.filters.removeAt(index);
	}

	addFilterRule(form: any) {
		form.controls.groupFilters.push(this.formFactory.createFilterRuleGroup());
	}

	removeFilterRule(form: any, index: number) {
		form.controls.groupFilters.removeAt(index);
	}

	addEntityField(form: any) {
		form.controls.data.controls.xaxisData.push(this.formFactory.createXaxisEntityField());

		if (form.controls.data.controls.xaxisData.length === 2) {
			this.hasTwoEntityFields = true;
		}
	}

	removeEntityField(form: any, index: number) {
		form.controls.data.controls.xaxisData.removeAt(index);

		if (form.controls.data.controls.xaxisData.length < 2) {
			this.hasTwoEntityFields = false;
		}

	}

	addDataseries() {
		this.dataseriesIncremment++;
    this.form.push(this.formFactory.createDataseriesGroup(this.dataseriesIncremment));

    setTimeout(() => {
      UIkit.tab('#dataseriesList').show(this.form.controls.length-1);
    });

	}

  duplicateDataseries(index: number) {
    const original = this.form.at(index) as FormGroup;

    // Ensure serializeControl is available in this class
    const richRaw = this.formFactory.serializeControl(original); // {value, disabled} tree
    console.log('serializeControl ->', JSON.stringify(richRaw));

    const copy = this.formFactory.createDataseriesGroup(index + 1, richRaw);
    this.form.push(copy);
  }

	removeDataseries(index: number) {
		this.form.removeAt(index);
	}

	editDataseriesTitle(index: number) {
    this.selectedTitleIndex = index;

    setTimeout( () => {
      this.editDataseriesName.focus(true);
    }, 0);
	}

	move(step: number, index: number) {
		let items = this.form as FormArray;
    [items.controls[index], items.controls[index + step]] = [items.controls[index + step], items.controls[index]]
	}

	checkYAxisAggregate(form: FormGroup): boolean {
		let data = form.controls['data'] as FormGroup;
		let yAxisData = data.controls['yaxisData'] as FormGroup;
		let yaxisAggregate = yAxisData.controls['yaxisAggregate'] as FormControl;

		if (yaxisAggregate && yaxisAggregate.value !== null) {
			return yaxisAggregate.value !== 'total';
		}
		return false;
	}

}
