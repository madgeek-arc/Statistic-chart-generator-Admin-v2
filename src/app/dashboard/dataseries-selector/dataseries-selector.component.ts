import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
  input
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged } from "rxjs/operators";
import { DbSchemaService } from "../../services/db-schema-service/db-schema.service";
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";
import { DynamicTreeDatabase } from "../../services/dynamic-tree-database/dynamic-tree-database.service";
import { Profile } from "../../services/mapping-profiles-service/mapping-profiles.service";
import { InputComponent } from "../../shared/input.component";
import UIkit from "uikit";
import { MatIcon } from '@angular/material/icon';
import { SelectAttributeComponent } from '../helper-components/select-attribute/select-attribute.component';
import { MatIconButton } from '@angular/material/button';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { AutocompleteInputFieldComponent } from '../helper-components/autocomplete-input-field/autocomplete-input-field.component';
import { FilterOperatorsPipe } from '../pipes/filter-operators.pipe';

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
    providers: [FormGroupDirective],
    imports: [ReactiveFormsModule, InputComponent, MatIcon, SelectAttributeComponent, MatIconButton, MatRadioGroup, MatRadioButton, AutocompleteInputFieldComponent, FilterOperatorsPipe]
})

export class DataseriesSelectorComponent implements OnInit {
  private dynamicTreeDB = inject(DynamicTreeDatabase);
  private dbService = inject(DbSchemaService);
  private formFactory = inject(FormFactoryService);

  private destroyRef = inject(DestroyRef);

	readonly selectedProfile = input<FormControl>(new FormControl());
	@ViewChild('editDataseriesName') editDataseriesName: InputComponent;

  form: FormArray<FormGroup> | null = null;

  entities: string[] = [];
  selectedTitleIndex = -1;
  selectedCategoryId: number | null = null;

	dataseriesIncremment = 0;


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
		{ filterOperator: 'in', filterName: 'In (any of)', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: 'not_in', filterName: 'Not in (none of)', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '>', filterName: 'Greater than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '>=', filterName: 'Greater / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '<', filterName: 'Less than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: '<=', filterName: 'Less / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: 'contains', filterName: 'Contains', filterType: [FieldType.text] },
		{ filterOperator: 'starts_with', filterName: 'Starts with', filterType: [FieldType.text] },
		{ filterOperator: 'ends_with', filterName: 'Ends with', filterType: [FieldType.text] },
		{ filterOperator: 'is_null', filterName: 'Is null', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
		{ filterOperator: 'is_not_null', filterName: 'Is not null', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] }
	];

	ngOnInit(): void {
		// With the change in stepper, the data is not created in the beginning, so it'll have to be initialized and not wait for "value changes"
    const profile = new Profile();

		const selectedProfile = this.selectedProfile();
		if (selectedProfile && selectedProfile.value) {
      profile.name = selectedProfile.value;
      this.handleProfileChange(profile);
		}

		selectedProfile.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((profileName: string) => {
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

  hide(element: HTMLElement) {
    UIkit.dropdown(element).hide();
  }

  handleProfileChange(profile: Profile | null) {
    this.dynamicTreeDB.changeEntityMap(profile);

    this.dbService.getAvailableEntities(profile).pipe(distinctUntilChanged()).subscribe({
      next: (entities: string[]) => {
        this.entities = entities;
      }
    });
  }

	getXAxisData(form: AbstractControl) {
		return (form.get('data.xaxisData') as FormArray).controls as FormGroup[];
	}

	getFilters(form: AbstractControl) {
		return (form.get('data.filters') as FormArray).controls as FormGroup[];
	}

	getGroups(form: AbstractControl) {
		return (form.get('groupFilters') as FormArray).controls as FormGroup[];
	}

	addFilter(form: AbstractControl) {
		const filters = form.get('data.filters') as FormArray;
		filters.push(this.formFactory.createFilterGroup());
    this.addFilterRule(filters.at(filters.length - 1));
  }

	removeFilter(form: AbstractControl, index: number) {
		(form.get('data.filters') as FormArray).removeAt(index);
	}

	addFilterRule(form: AbstractControl) {
		(form.get('groupFilters') as FormArray).push(this.formFactory.createFilterRuleGroup());
	}

	removeFilterRule(form: AbstractControl, index: number) {
		(form.get('groupFilters') as FormArray).removeAt(index);
	}

	getFilterValues(group: AbstractControl) {
		return (group.get('values') as FormArray).controls as FormControl[];
	}

	addFilterValue(group: AbstractControl) {
		(group.get('values') as FormArray).push(new FormControl(null));
	}

	removeFilterValue(group: AbstractControl, index: number) {
		const values = group.get('values') as FormArray;
		values.removeAt(index);
		if (values.length === 0) {
			values.push(new FormControl(null));
		}
	}

	addEntityField(form: AbstractControl) {
		(form.get('data.xaxisData') as FormArray).push(this.formFactory.createXaxisEntityField());
	}

	removeEntityField(form: AbstractControl, index: number) {
		(form.get('data.xaxisData') as FormArray).removeAt(index);
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
		const items = this.form as FormArray;
    const newIndex = index + step;
    if (newIndex >= 0 && newIndex < items.length) {
      const control = items.at(index);
      items.removeAt(index);
      items.insert(newIndex, control);
    }
	}

	checkYAxisAggregate(form: FormGroup): boolean {
		const data = form.controls['data'] as FormGroup;
		const yAxisData = data.controls['yaxisData'] as FormGroup;
		const yaxisAggregate = yAxisData.controls['yaxisAggregate'] as FormControl;

		if (yaxisAggregate && yaxisAggregate.value !== null) {
			return yaxisAggregate.value !== 'total';
		}
		return false;
	}

  protected readonly FormGroup = FormGroup;
}
