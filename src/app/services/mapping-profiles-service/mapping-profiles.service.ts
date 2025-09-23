import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

export class Profile {
	name: string = '';
	description: string = '';
	usage: string = '';
	shareholders: string[] = [];
	complexity: number = -1;
}

@Injectable({
	providedIn: 'root'
})
export class MappingProfilesService {
	mappingProfiles$: BehaviorSubject<Array<Profile>>;
	selectedProfile$: BehaviorSubject<Profile | null>;

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
		// private errorHandler: ErrorHandlerService
	) {
		this.selectedProfile$ = new BehaviorSubject<Profile | null>(null);
		this.mappingProfiles$ = new BehaviorSubject<Array<Profile>>([]);

		const sub = this.getProfileMappings().subscribe(
			(result: Profile[]) => {
				this.mappingProfiles$.next(result);
			},
			(err: any) => {
				// errorHandler.handleError(err);
			},
			() => {
				sub.unsubscribe();
			}
		);
	}

	changeSelectedProfile(profile: string) {

		var selectedProfile = this.mappingProfiles$.value.find((e: Profile) => e.name === profile);

		if (selectedProfile !== undefined)
			this.selectedProfile$.next(selectedProfile);
		else
			this.selectedProfile$.next(null);
	}

	private getProfileMappings(): Observable<Array<Profile>> {

		const profileMappingsUrl = this.urlProvider.serviceURL + '/schema/profiles';

		return this.http.get<Array<Profile>>(profileMappingsUrl);
	}

	get activeProfile() {
		return this.selectedProfile$.getValue();
	}

}
