import { NestedTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject, Observable, distinctUntilChanged, first, forkJoin } from 'rxjs';
import { EntityProviderService } from 'src/app/services/entity-provider/entity-provider.service';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';

@Component({
	selector: 'app-dataseries-selector',
	templateUrl: './dataseries-selector.component.html',
	styleUrls: ['./dataseries-selector.component.less']
})
export class DataseriesSelectorComponent implements OnInit {

	@Input('dataseriesForm') dataseriesForm: FormGroup;
	@Input('selectedProfile') selectedProfile: FormControl = new FormControl;

	// dataSource = new MatTreeNestedDataSource<EntityNode>();
	// treeControl = new NestedTreeControl<EntityNode>(node => node.relations);

	testingSelect: string = '';
	entities: Array<string> = [];
	selectedEntity: string = '';
	entitySelection: string = 'Select Entity';

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

	constructor(
		private formBuilder: FormBuilder,
		private http: HttpClient,
		private entityProvider: EntityProviderService,
		private urlProvider: UrlProviderService
	) {
		this.dataseriesForm = new FormGroup({
			entity: this.formBuilder.control(null, Validators.required)
		});
	}

	hasChild = (_: number, node: EntityNode) => !!node.relations && node.relations.length > 0;


	get entity(): FormControl {
		return this.dataseriesForm.get('entity') as FormControl;
	}

	ngOnInit(): void {
		this.selectedProfile.valueChanges.subscribe((profile: Profile) => {
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
	}

	private getEntityRelations(profile: Profile, entity: string): Observable<CachedEntityNode> {
		// const entityRelationsUrl = 'http://stats.madgik.di.uoa.gr:8180/schema/' + profile.name +'/entities/' + entity;
		const entityRelationsUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities/' + entity;

		return this.http.get<CachedEntityNode>(entityRelationsUrl);
	}


	// selectEntity(entity: string): void {
	// 	this.dataseriesForm.get('entity')?.setValue(entity);
	// }



	selectEntity(event: MatSelectChange): void {
		console.log("selectEntity event:", event);
		this.dataseriesForm.get('entity')?.setValue(event.value);

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

	selectAggregate(event: MatSelectChange): void {
		console.log("selectAggregate event:", event);
		this.dataseriesForm.get('aggregate')?.setValue(event.value);
	}

	testLog(): void {
		console.log("this.dataseriesForm.value:", this.dataseriesForm.value);
	}

	selectEntityField(event: MatSelectChange): void {
		this.dataseriesForm.get('entityField')?.setValue(event.value);
	}

	isExpandionPanelOpen(event: any): boolean {
		let isPanelOpenFlag: boolean = false;

		// check the selected value if it is part of an expansion panel and keep it open. Close others.

		return isPanelOpenFlag;
	}

	outputResult(event: any): void {
		console.log("FINAL PATH:", event);
	}

}


export class EntityTreeNode {
	fields: FieldNode[];
	relations: EntityTreeNode[];
	name: string;
	parent: EntityTreeNode;

	constructor(fields: FieldNode[], relations: EntityTreeNode[], name: string, parent: EntityTreeNode) {
		this.fields = fields;
		this.relations = relations;
		this.name = name;
		this.parent = parent;
	}
}

export class EntityNode {
	fields: FieldNode[];
	relations: EntityNode[];
	name: string;

	constructor() {
		this.fields = [];
		this.relations = [];
		this.name = '';
	}
}
export class CachedEntityNode {
	fields: FieldNode[];
	relations: string[];
	name: string;

	constructor() {
		this.fields = [];
		this.relations = [];
		this.name = '';
	}
}
export class FieldNode {
	name: string;
	type: string;

	constructor() {
		this.name = '';
		this.type = '';
	}
}