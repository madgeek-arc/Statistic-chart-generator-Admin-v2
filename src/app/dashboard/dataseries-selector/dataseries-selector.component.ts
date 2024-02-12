import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

	testingSelect: string = '';
	entities: Array<string> = [];
	selectedEntity: string = '';
	entitySelection: string = 'Select Entity';

	private _entityMap$: BehaviorSubject<Map<string, CachedEntityNode>> = new BehaviorSubject(new Map<string, CachedEntityNode>());

	constructor(
		private formBuilder: FormBuilder,
		private http: HttpClient,
		private entityProvider: EntityProviderService,
		private urlProvider: UrlProviderService
	) {
		this.dataseriesForm = new FormGroup({
			entity: this.formBuilder.control(null, Validators.required)
		})
	}

	get entity(): FormControl {
		return this.dataseriesForm.get('entity') as FormControl;
	}

	ngOnInit(): void {
		this.selectedProfile.valueChanges.subscribe((profile: Profile) => {
			if (profile) {
				this.entityProvider.getAvailableEntities(profile).pipe(first()).subscribe((entityNames: Array<string>) => {
					console.log("Entity Names:", entityNames);
					this.entities = entityNames;

					let entityMap = new Map<string, CachedEntityNode>(new Map<string, CachedEntityNode>());

					let entityArray = entityNames.map((entity: string) => {
						return this.getEntityRelations(profile, entity).pipe(first());
					});

					forkJoin(entityArray).subscribe((cachedEntityNodes: CachedEntityNode[]) => {
						console.log("Cached Entity Nodes:", cachedEntityNodes);

						for (let i = 0; i < entityNames.length; i++) {
							entityMap.set(entityNames[i], cachedEntityNodes[i]);
						}

						console.log("Cached Entity Map:", entityMap);

						if (entityMap.size > 0) {
							this._entityMap$.next(entityMap);
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


	selectEntity(entity: string): void {
		this.dataseriesForm.get('entity')?.setValue(entity);
	}

	testLog(): void {
		console.log("this.dataseriesForm.get('entity'):", this.dataseriesForm.get('entity')?.value);
	}

	someMethod(event: any): void {
		this.dataseriesForm.get('entity')?.setValue(event.value);
		this.selectedEntity = event.value;
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