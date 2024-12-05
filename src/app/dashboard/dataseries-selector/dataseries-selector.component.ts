import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, first, forkJoin } from 'rxjs';
import { EntityProviderService } from 'src/app/services/entity-provider/entity-provider.service';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';
import { CachedEntityNode, EntityNode } from '../helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';

@Component({
	selector: 'app-dataseries-selector',
	templateUrl: './dataseries-selector.component.html',
	styleUrls: ['./dataseries-selector.component.less']
})
export class DataseriesSelectorComponent implements OnInit {

	@Input('selectedView') selectedView: FormControl = new FormControl();

	// dataSource = new MatTreeNestedDataSource<EntityNode>();
	// treeControl = new NestedTreeControl<EntityNode>(node => node.relations);

	testingSelect: string = '';
	entities: Array<string> = [];
	selectedEntity: string = '';
	entitySelection: string = 'Select Entity';
  form: FormArray;

	openedPanels: Array<number> = [];

	// testing
	panelOpenState: boolean = false;

	private _entityMap$: BehaviorSubject<Map<string, CachedEntityNode>> = new BehaviorSubject(new Map<string, CachedEntityNode>());
	protected entityMap = new Map<string, CachedEntityNode>(new Map<string, CachedEntityNode>());
	protected selectedEntityMap: Array<CachedEntityNode> = [];

	// check "getSupportedAggregateFunctionFilterY" in Admin v1 and see if we should change how we get these.
	protected aggregates = [
		{ name: 'Total', code: 'total' },
		{ name: 'Count', code: 'count' },
		{ name: 'Sum', code: 'sum' },
		{ name: 'Minimum', code: 'min' },
		{ name: 'Maximum', code: 'max' },
		{ name: 'Average', code: 'avg' }
	];

	protected stackedDataList = [
		{ name: 'Disabled', value: 'null' },
		{ name: 'Stacked by Value', value: 'normal' },
		{ name: 'Stacked by Percentage', value: 'percent' }
	];


	protected filterFields = [
		"name",
		"number"
	]

	protected filterOperators = [
		'Equals',
		'Not Equals',
		'Contains',
		'Starts With',
		'Ends With'
	]


	constructor(
		private http: HttpClient,
		private entityProvider: EntityProviderService,
		private urlProvider: UrlProviderService,
		private formBuilder: FormBuilder,
    private rootFormGroup: FormGroupDirective
	) { }

	hasChild = (_: number, node: EntityNode) => !!node.relations && node.relations.length > 0;

  ngOnInit(): void {
    this.selectedView.valueChanges.subscribe((profile: Profile) => {
      if (profile) {
        this.entityProvider.getAvailableEntities(profile).pipe(first()).subscribe((entityNames: Array<string>) => {
          console.log("Entity Names:", entityNames);
          this.entities = entityNames;

          let entityArray = entityNames.map((entity: string) => {
            return this.getEntityRelations(profile, entity).pipe(first());
          });

          forkJoin(entityArray).subscribe((cachedEntityNodes: CachedEntityNode[]) => {
            console.log("Cached Entity Nodes:", cachedEntityNodes);

            for (let i = 0; i < entityNames.length; i++) {
              this.entityMap.set(entityNames[i], cachedEntityNodes[i]);
            }

            console.log("Cached Entity Map:", this.entityMap);

            if (this.entityMap.size > 0) {
              this._entityMap$.next(this.entityMap);
            }
          });
        })
      }
    });

    this.form = this.rootFormGroup.control.get('dataseries') as FormArray;
    console.log(this.form);
  }


	entity(index: number): FormControl {
    return this.form.controls[index].get('data.yaxisData.entity') as FormControl;
	}

	aggregate(index: number): FormControl {
		return this.form.controls[index].get('data.yaxisData.yaxisAggregate') as FormControl;
	}

	entityField(index: number): FormControl {
    // FIXME: I return fist control (controls[0]), this is bad and should be fixed!
    return (this.form.controls[index].get('data.xaxisData') as FormArray).controls[0].get('xaxisEntityField.name') as FormControl;
	}

	stackedData(index: number): FormControl {
    return this.form.controls[index].get('chartProperties.stacking') as FormControl;
	}

	filters(index: number): FormArray {
    return this.form.controls[index].get('data.filters') as FormArray;
	}

	private getEntityRelations(profile: Profile, entity: string): Observable<CachedEntityNode> {
		// const entityRelationsUrl = 'http://stats.madgik.di.uoa.gr:8180/schema/' + profile.name +'/entities/' + entity;
		const entityRelationsUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities/' + entity;

		return this.http.get<CachedEntityNode>(entityRelationsUrl);
	}


	selectEntity(event: MatSelectChange): void {
		console.log("selectEntity event:", event);
		// this.entity.setValue(event.value);

		this.selectedEntity = event.value;

		// check which panels will be opened by default after the creation of the "tree" to see how big it will be depending on the entity selected
		// testing

		this.panelOpenState = true;

		this.selectedEntityMap = Array.from(this.entityMap.values()).filter((item: any) => {
			if (item.name === this.selectedEntity) {
				return item;
			}
		});


		console.log("selectedEntityMap:", this.selectedEntityMap);
	}

	isExpandionPanelOpen(event: any): boolean {
		let isPanelOpenFlag: boolean = false;

		// check the selected value if it is part of an expansion panel and keep it open. Close others.

		return isPanelOpenFlag;
	}

	createfilter() {
		let groupFilters = this.formBuilder.array([]) as FormArray;

		groupFilters.push(this.createGroupFilter())

		return filter;
	}

	addFilter(index: number) {
		this.filters(index).push(this.createfilter());

		console.log("Filter Added");
	}

	removeFilter(index: number, position: number) {
		this.filters(index).removeAt(position);

		console.log("Filter Removed");
	}

	createGroupFilter(): FormGroup {
		let formGroup = new FormGroup({
			field: this.formBuilder.group({
				name: this.formBuilder.control(null),
				type: this.formBuilder.control(null)
			}),
			type: this.formBuilder.control(null),
			values: this.formBuilder.control([])
		});

		return formGroup;
	}


	testFilters() {
		console.log("Filters:", this.filters);
	}

	outputResult(event: any): void {
		console.log("FINAL PATH:", event);
	}

	testLog(): void {
		console.log("this.dataseriesForm.value:", this.form.value);
	}
}

export class DataSelectionFilter {
	entityField: string;
	filterOperator: string;
	filterValue: string;
}


// export class EntityTreeNode {
// 	fields: FieldNode[];
// 	relations: EntityTreeNode[];
// 	name: string;
// 	parent: EntityTreeNode;

// 	constructor(fields: FieldNode[], relations: EntityTreeNode[], name: string, parent: EntityTreeNode) {
// 		this.fields = fields;
// 		this.relations = relations;
// 		this.name = name;
// 		this.parent = parent;
// 	}
// }

// export class EntityNode {
// 	fields: FieldNode[];
// 	relations: EntityNode[];
// 	name: string;

// 	constructor() {
// 		this.fields = [];
// 		this.relations = [];
// 		this.name = '';
// 	}
// }
// export class CachedEntityNode {
// 	fields: FieldNode[];
// 	relations: string[];
// 	name: string;

// 	constructor() {
// 		this.fields = [];
// 		this.relations = [];
// 		this.name = '';
// 	}
// }
// export class FieldNode {
// 	name: string;
// 	type: string;

// 	constructor() {
// 		this.name = '';
// 		this.type = '';
// 	}
// }
