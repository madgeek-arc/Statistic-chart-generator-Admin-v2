import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { retry } from 'rxjs/operators';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { Profile } from '../mapping-profiles-service/mapping-profiles.service';

@Injectable({
	providedIn: 'root'
})
export class DbSchemaService {

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
	) { }

	getAvailableEntities(profile: Profile | null | undefined): Observable<string[]> {
    if (profile === undefined || profile === null) {
			return of([]);
		}

		const entitiesUrl = this.urlProvider.serviceURL + '/schema/' + profile.name + '/entities';
		return this.http.get<string[]>(entitiesUrl)
			.pipe(
				retry(3), // retry a failed request up to 3 times
			);
	}
}
