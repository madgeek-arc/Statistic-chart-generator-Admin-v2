import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { Profile } from '../mapping-profiles-service/mapping-profiles.service';
// import { ErrorHandlerService } from '../error-handler-service/error-handler.service';

@Injectable({
	providedIn: 'root'
})
export class DbSchemaService {

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
		// private errorHandler: ErrorHandlerService
	) { }

	getAvailableEntities(profile: Profile | null | undefined): Observable<Array<string>> {
		console.log("PROFILE dbschema:", profile);

		if (profile === undefined || profile === null) {
			// return this.getAvailableEntitiesNoMapping();
			return of([]);
		}

		const entitiesUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities';
		return this.http.get<Array<string>>(entitiesUrl)
			.pipe(
				retry(3), // retry a failed request up to 3 times
				// catchError(this.errorHandler.handleError) // then handle the error
			);
	}

	getAvailableEntitiesNoMapping(): Observable<Array<string>> {

		const entitiesUrl = this.urlProvider.serviceURL + '/schema/entities';
		return this.http.get<Array<string>>(entitiesUrl)
			.pipe(
				retry(3), // retry a failed request up to 3 times
				// catchError(this.errorHandler.handleError) // then handle the error
			);
	}

	// getEntityFields(entity: string, profile?: Profile) {

	//   if (profile === undefined || profile === null) { return this.getEntityFieldsNoMapping(entity); }

	//   const entityFieldsUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities/' + entity;
	//   return this.http.get<EntityNode>(entityFieldsUrl)
	//     .pipe(
	//       retry(3), // retry a failed request up to 3 times
	//       catchError(this.errorHandler.handleError) // then handle the error
	//   );
	// }

	// getEntityFieldsNoMapping(entity: string): Observable<EntityNode> {

	//   const entityFieldsUrl = this.urlProvider.serviceURL + '/schema/entities/' + entity;
	//   return this.http.get<EntityNode>(entityFieldsUrl)
	//     .pipe(
	//       retry(3), // retry a failed request up to 3 times
	//       catchError(this.errorHandler.handleError) // then handle the error
	//   );
	// }

	// getEntityTree(rootNode: EntityNode): EntityTreeNode {
	//   return this.createEntityLinkedTree(null, rootNode);
	// }

	// private createEntityLinkedTree(parentNode: EntityTreeNode, recreatedNode: EntityNode): EntityTreeNode {

	//   const newEntityTreeNode = new EntityTreeNode(recreatedNode.fields, new Array<EntityTreeNode>(), recreatedNode.name, parentNode);

	//   if (recreatedNode.relations) {
	//     recreatedNode.relations.forEach(element => {
	//       newEntityTreeNode.relations.push(this.createEntityLinkedTree(newEntityTreeNode, element));
	//     });
	//     return newEntityTreeNode;
	//   }
	//   return null;
	// }
}
