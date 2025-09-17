import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, first, forkJoin, Observable } from 'rxjs';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';
import {
  CachedEntityNode,
  EntityNode
} from '../helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';
import { DbSchemaService } from "../../services/db-schema-service/db-schema.service";
import UIkit from "uikit";
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";

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

	@Input('formGroup') formGroup: FormGroup;
	@Input('selectedProfile') selectedProfile: FormControl = new FormControl();
	@Input('selectedCategory') selectedCategoryName: FormControl = new FormControl();
	@ViewChild('editDataseriesName') editDataseriesName;

	entities: Array<string> = [];
	selectedEntity: string = '';
	form: FormArray<FormGroup>;
  selectedTitleIndex = -1;
	panelOpenState: boolean = false;

	hasTwoEntityFields: boolean = false;
	dataseriesIncremment: number = 0;

	private _entityMap$: BehaviorSubject<Map<string, CachedEntityNode>> = new BehaviorSubject(new Map<string, CachedEntityNode>());
	protected entityMap = new Map<string, CachedEntityNode>(new Map<string, CachedEntityNode>());
	protected selectedEntityMap: Array<CachedEntityNode> = [];

  protected aggregates = [
    { label: 'Total', value: 'total' },
    { label: 'Count', value: 'count' },
    { label: 'Sum', value: 'sum' },
    { label: 'Minimum', value: 'min' },
    { label: 'Maximum', value: 'max' },
    { label: 'Average', value: 'avg' }
  ];

	protected stackedDataList = [
		{ name: 'Disabled', value: 'null' },
		{ name: 'Stacked by Value', value: 'normal' },
		{ name: 'Stacked by Percentage', value: 'percent' }
	];

	protected chartTypeList = [
		{ name: 'Disabled', value: 'null' },
		{ name: 'Area', value: 'area' },
		{ name: 'Bar', value: 'bar' },
		{ name: 'Column', value: 'column' },
		{ name: 'Line', value: 'line' },
		{ name: 'Pie', value: 'pie' },
		{ name: 'Treemap', value: 'treemap' },
		{ name: 'Dependencywheel', value: 'dependencywheel' },
		{ name: 'Sankey', value: 'sankey' }
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
		private http: HttpClient,
		private dbService: DbSchemaService,
		private urlProvider: UrlProviderService,
    private formFactory: FormFactoryService,
	) { }

	hasChild = (_: number, node: EntityNode) => !!node.relations && node.relations.length > 0;

	ngOnInit(): void {
		// With the change in stepper, the data is not created in the beginning, so it'll have to be initialized and not wait for "value changes"

		if (this.selectedProfile && this.selectedProfile.value) {
			this.getEntities({
				name: this.selectedProfile.value,
				description: '',
				usage: '',
				shareholders: [],
				complexity: -1,
			} as Profile);
		}

		this.selectedProfile.valueChanges.subscribe((profile: any) => {
			if (profile) {
				this.getEntities({
					name: profile,
					description: '',
					usage: '',
					shareholders: [],
					complexity: -1,
				} as Profile);
			}
		});

		this.form = this.formGroup.get('dataseries') as FormArray;
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


  getEntities(profile: Profile): void {
		this.dbService.getAvailableEntities(profile).pipe(first()).subscribe((entityNames: Array<string>) => {
			this.entities = entityNames;

			let entityArray = entityNames.map((entity: string) => {
				return this.getEntityRelations(profile, entity).pipe(first());
			});

			forkJoin(entityArray).subscribe((cachedEntityNodes: CachedEntityNode[]) => {

				for (let i = 0; i < entityNames.length; i++) {
					this.entityMap.set(entityNames[i], cachedEntityNodes[i]);
				}

				if (this.entityMap.size > 0) {
					this._entityMap$.next(this.entityMap);
				}
			});
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

	private getEntityRelations(profile: Profile, entity: string): Observable<CachedEntityNode> {
		// const entityRelationsUrl = 'http://stats.madgik.di.uoa.gr:8180/schema/' + profile.name +'/entities/' + entity;
		const entityRelationsUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities/' + entity;

		return this.http.get<CachedEntityNode>(entityRelationsUrl);
	}


	selectEntity(event: MatSelectChange): void {
		this.selectedEntity = event.value;

		this.panelOpenState = true;

		this.selectedEntityMap = Array.from(this.entityMap.values()).filter((item: any) => {
			if (item.name === this.selectedEntity) {
				return item;
			}
		});

	}

	isExpandionPanelOpen(event: any): boolean {
		let isPanelOpenFlag: boolean = false;

		// check the selected value if it is part of an expansion panel and keep it open. Close others.

		return isPanelOpenFlag;
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

    let index = form.controls.groupFilters.controls.length - 1;
    form.controls.groupFilters.controls[index].get('field.type').valueChanges.subscribe({
      next: value => {
        if (value !== null && value !== undefined) {
          form.controls.groupFilters.controls[index].get('type').enable();
        }
      }
    });
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

    // Add this: Force entity propagation for the new dataseries
    // setTimeout(() => {
    //   // Get the entity value from the duplicated form
    //   const entityControl = copy.get('data.yaxisData.entity');
    //   if (entityControl && entityControl.value) {
    //     // Trigger entity change detection for the new select-attribute components
    //     entityControl.updateValueAndValidity({ emitEvent: true });
    //
    //     // Also trigger change detection for xaxis fields
    //     const xaxisArray = copy.get('data.xaxisData') as FormArray;
    //     if (xaxisArray) {
    //       xaxisArray.controls.forEach(xaxisControl => {
    //         const fieldControl = xaxisControl.get('xaxisEntityField');
    //         if (fieldControl) {
    //           fieldControl.updateValueAndValidity({ emitEvent: true });
    //         }
    //       });
    //     }
    //
    //     // Trigger for filter fields
    //     const filtersArray = copy.get('data.filters') as FormArray;
    //     if (filtersArray) {
    //       console.log(original.get('data.filters').value);
    //       console.log('copping filter arrays: ');
    //       console.log(filtersArray.value);
    //       filtersArray.controls.forEach(filterControl => {
    //         const groupFiltersArray = filterControl.get('groupFilters') as FormArray;
    //         if (groupFiltersArray) {
    //           groupFiltersArray.controls.forEach(ruleControl => {
    //             const fieldControl = ruleControl.get('field');
    //             if (fieldControl) {
    //               fieldControl.updateValueAndValidity({ emitEvent: true });
    //             }
    //           });
    //         }
    //       });
    //     }
    //   }
    // }, 2000); // Give time for the new form controls to be rendered


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

	changePosition(direction: string, index: number) {
		let items = this.form as FormArray;
		if (direction === 'up') {
			[items.controls[index - 1], items.controls[index]] = [items.controls[index], items.controls[index - 1]]
		} else if (direction === 'down') {
			[items.controls[index], items.controls[index + 1]] = [items.controls[index + 1], items.controls[index]]
		}
	}

	checkYAxisAggregate(form: FormGroup): boolean {
		let data = form.controls['data'] as FormGroup;
		let yAxisData = data.controls['yaxisData'] as FormGroup;
		let yaxisAggregate = yAxisData.controls['yaxisAggregate'] as FormControl;

		if (yaxisAggregate && yaxisAggregate.value !== null) {
			if (yaxisAggregate.value === 'total') {
				return false;
			} else {
				return true;
			}
		}
		return false;
	}

}
