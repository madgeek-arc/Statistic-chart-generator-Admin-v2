import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, first, forkJoin, Observable } from 'rxjs';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';
import {
	CachedEntityNode,
	EntityNode
} from '../helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';
import { DbSchemaService } from "../../services/db-schema-service/db-schema.service";

@Component({
	selector: 'app-dataseries-selector',
	templateUrl: './dataseries-selector.component.html',
	styleUrls: ['./dataseries-selector.component.less']
})
export class DataseriesSelectorComponent implements OnInit {

	@Input('selectedView') selectedView: FormControl = new FormControl();
	@Input('selectedCategory') selectedCategoryName: FormControl = new FormControl();;
	@ViewChild('editDataseriesName') editDataseriesName: ElementRef;
	// dataSource = new MatTreeNestedDataSource<EntityNode>();
	// treeControl = new NestedTreeControl<EntityNode>(node => node.relations);

	testingSelect: string = '';
	entities: Array<string> = [];
	selectedEntity: string = '';
	entitySelection: string = 'Select Entity';
	form: FormArray<FormGroup>;
	editableDataseriesTitleList: Array<boolean> = [false];
	openedPanels: Array<number> = [];

	// testing
	panelOpenState: boolean = false;

	hasTwoEntityFields: boolean = false;
	dataseriesIncremment: number = 0;

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
		private entityProvider: DbSchemaService,
		private urlProvider: UrlProviderService,
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

	addFilter(form: any) {
		form.controls.data.controls.filters.push(
			new FormGroup({
				groupFilters: new FormArray([
					new FormGroup({
						field: new FormGroup({
							name: new FormControl<string | null>(null),
							type: new FormControl<string | null>(null)
						}),
						type: new FormControl<string | null>(null),
						values: new FormArray([
							new FormControl(null)
						]) // TODO: Add shortcut through addFilterRule
					})
				]),
				op: new FormControl<string | null>(null)
			})
		);
	}

	removeFilter(form: any, index: number) {
		form.controls.data.controls.filters.removeAt(index);
	}

	addFilterRule(form: any) {
		form.controls.groupFilters.push(
			new FormGroup({
				field: new FormGroup({
					name: new FormControl<string | null>(null),
					type: new FormControl<string | null>(null)
				}),
				type: new FormControl<string | null>(null),
				values: new FormArray([
					new FormControl(null)
				]) // TODO: At model the control is set as array!!! Check for compatibility issues
			})
		)
	}

	removeFilterRule(form: any, index: number) {
		form.controls.groupFilters.removeAt(index);
	}

	addEntityField(form: any) {
		form.controls.data.controls.xaxisData.push(
			new FormGroup({
				xaxisEntityField: new FormGroup({
					name: new FormControl<string | null>(null),
					type: new FormControl<string | null>(null)
				})
			})
		);

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
		this.editableDataseriesTitleList.push(false);

		this.form.push(new FormGroup({
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
				dataseriesName: new FormControl<string | null>({ value: 'Data(' + this.dataseriesIncremment + ')', disabled: true }),
				stacking: new FormControl<'null' | 'normal' | 'percent' | 'stream' | 'overlap'>('null', Validators.required),
			}),
		}),);

	}

	removeDataseries(index: number) {
		this.form.removeAt(index);
		this.editableDataseriesTitleList.splice(index, 1);
	}

	getDataSeriesName(form: FormGroup) {
		let chartProperties = form.controls['chartProperties'] as FormGroup;
		let dataseriesName = chartProperties.controls['dataseriesName'] as FormControl;

		return dataseriesName.value;
	}

	isEditableDataseriesTitle(form: FormGroup) {
		let chartProperties = form.controls['chartProperties'] as FormGroup;
		let dataseriesName = chartProperties.controls['dataseriesName'] as FormControl;

		return dataseriesName.enabled;
	}

	editDataseriesTitle(form: FormGroup) {
		let chartProperties = form.controls['chartProperties'] as FormGroup;
		let dataseriesName = chartProperties.controls['dataseriesName'] as FormControl;
		dataseriesName.enable();


		if (this.editDataseriesName) {
			console.log("this.editDataseriesName:", this.editDataseriesName);
			this.editDataseriesName.nativeElement.focus();
		}
	}

	saveDataseriesTitle(form: FormGroup) {
		let chartProperties = form.controls['chartProperties'] as FormGroup;
		let dataseriesName = chartProperties.controls['dataseriesName'] as FormControl;
		dataseriesName.disable();
	}

	testBlur(form: FormGroup) {
		console.log("BLUR");
	}

	checkEnabled(form: FormGroup): boolean {
		let chartProperties = form.controls['chartProperties'] as FormGroup;
		let dataseriesName = chartProperties.controls['dataseriesName'] as FormControl;
		return dataseriesName.enabled;
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

	getClass(length: number, position: number): string {
		switch (true) {
			case (length === 1):
				return '2';
			case (length === 2):
				return '4'
			case (length >= 3):
				switch (position) {
					case 0:
						return '4';
					case (length - 1):
						return '4'
					default:
						return '5';
				}
			default:
				return '2';
		}
	}

	printDataseries() {
		console.log("this.form:", this.form);
		console.log("this.form.value:", this.form.value);
	}

	outputResult(event: any): void {
		console.log("FINAL PATH:", event);
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
