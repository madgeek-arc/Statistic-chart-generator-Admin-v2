import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { DbSchemaService } from '../db-schema-service/db-schema.service';
import { MappingProfilesService, Profile } from '../mapping-profiles-service/mapping-profiles.service';
import { CachedEntityNode, DynamicEntityNode } from 'src/app/dashboard/helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({
	providedIn: 'root'
})
export class DynamicTreeDatabase {

	public loading = false;

	// The cached data of a Profile's Entities
	public get entityMap(): Map<string, CachedEntityNode> { return this._entityMap$.getValue() as Map<string, CachedEntityNode>; }
	private _entityMap$ = new BehaviorSubject<Map<string, CachedEntityNode> | null>(null);

	constructor(private http: HttpClient, private urlProvider: UrlProviderService,
		private profileMappingService: MappingProfilesService, private dbService: DbSchemaService) {

		this.profileMappingService.selectedProfile$.pipe(distinctUntilChanged()).subscribe(
			(profile: Profile | null) => { this.changeEntityMap(profile); }
		);
	}

	private getEntityRelations(profile: Profile | null, entity: string): Observable<CachedEntityNode> {
		// const entityRelationsUrl = 'http://stats.madgik.di.uoa.gr:8180/schema/' + profile.name +'/entities/' + entity;
		const entityRelationsUrl = this.urlProvider.serviceURL + '/schema/' + profile?.name + '/entities/' + entity;

		return this.http.get<CachedEntityNode>(entityRelationsUrl);
	}

	changeEntityMap(profile: Profile | null) {
		if (profile === null) { // If null value is passed the whole thing fails... Don't know why.
			profile = new Profile();
		}

		console.log("BREAKPOINT");
		console.log("profile", profile);

		this.dbService.getAvailableEntities(profile).pipe(first())
			.subscribe((entityNames: string[]) => {
				console.log("Dynamic Tree DB");
				var entityMap = new Map<string, CachedEntityNode>(new Map<string, CachedEntityNode>());

				var array$ = entityNames.map(entity => this.getEntityRelations(profile, entity).pipe(first()));
				forkJoin(array$).subscribe((cachedEntityNodes: CachedEntityNode[]) => {

					// forkJoin results are in the same sequence as its Observable inputs
					// As such the cachedEntityNodes are matched in size and index by the entityNames
					for (let index = 0; index < entityNames.length; index++)
						entityMap.set(entityNames[index], cachedEntityNodes[index]);

					console.log("Cached Entity Map :", entityMap);
					if (entityMap.size > 0)
						this._entityMap$.next(entityMap);
				});
			});
	}

	getRootNode(entity: string): BehaviorSubject<DynamicEntityNode | null> | undefined {
		var root = new BehaviorSubject<DynamicEntityNode | null>(null);

		// We only care for the first map that has entries, in order to get the root node.
		console.log(this._entityMap$.value);
		this._entityMap$.pipe(filter(map => map?.size! > 0), first()).subscribe(map => {

			if (map == null)
				return;

			var rootEntityNode = map.get(entity);

			if (rootEntityNode != null)
				root.next(new DynamicEntityNode(rootEntityNode.fields, rootEntityNode.name, [], null));
		});

		return root;
	}

	getChildren(entityNode: DynamicEntityNode): BehaviorSubject<DynamicEntityNode[]> | undefined {
		var children: DynamicEntityNode[] = [];
		var children$ = new BehaviorSubject<DynamicEntityNode[]>(children);

		console.log("Requesting children of DynamicEntityNode:", entityNode);

		if (entityNode == null)
			return children$;

		// Get the cached version of the given Entity Node, out of the first map that has entries.
		this._entityMap$.pipe(filter(map => map?.size! > 0), first()).subscribe(map => {

			if (map == null)
				return;

			var cachedEntityNode = map.get(entityNode.name);
			if (cachedEntityNode && cachedEntityNode.relations != null) {
				// Get the relations of the cached Entity Node
				cachedEntityNode.relations.forEach(relationNodeName => {

					// Get a cached Entity Node as a relation of the given Entity Node
					var cachedRelationEntityNode = map.get(relationNodeName);

					if (cachedRelationEntityNode && map.has(relationNodeName)) {
						// Clone the path of the parent Entity node
						var deeperPath = new Array<string>();
						entityNode.path.map(node => deeperPath.push(node));

						// Create a new Entity Node based on the cached Entity node and the parent path
						children.push(new DynamicEntityNode(cachedRelationEntityNode.fields, cachedRelationEntityNode.name, deeperPath, undefined, entityNode));
					}
				});
			}
			children$.next(children);
		});

		return children$;
	}

}
