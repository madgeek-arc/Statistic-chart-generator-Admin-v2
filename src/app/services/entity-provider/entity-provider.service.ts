import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, retry } from 'rxjs';
import { UrlProviderService } from '../url-provider/url-provider.service';
import { Profile } from '../profile-provider/profile-provider.service';


@Injectable({
	providedIn: 'root'
})
export class EntityProviderService {

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
		//  private errorHandler: ErrorHandlerService
	) { }

	getAvailableEntities(profile: Profile | null | undefined): Observable<Array<string>> {
		console.log("PROFILE:", profile);

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

}

