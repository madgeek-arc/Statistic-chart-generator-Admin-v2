import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

export class Profile {
	name = '';
	description = '';
	usage = '';
	shareholders: string[] = [];
	complexity = -1;
}

@Injectable({
	providedIn: 'root'
})
export class MappingProfilesService {
	private http = inject(HttpClient);
	private urlProvider = inject(UrlProviderService);

	mappingProfiles$: BehaviorSubject<Profile[]>;
	selectedProfile$: BehaviorSubject<Profile | null>;

	constructor() {

		this.selectedProfile$ = new BehaviorSubject<Profile | null>(null);
		this.mappingProfiles$ = new BehaviorSubject<Profile[]>([]);

		const sub = this.getProfileMappings().subscribe({
      next: (result: Profile[]) => {
        this.mappingProfiles$.next(result);
      },
      error: err => {
        console.error("Error:", err)
      },
      complete: () => {
        sub.unsubscribe();
      }
    });
	}

	changeSelectedProfile(profile: string) {
    const selectedProfile = this.mappingProfiles$.value.find((e: Profile) => e.name === profile);

    if (selectedProfile !== undefined)
			this.selectedProfile$.next(selectedProfile);
		else
			this.selectedProfile$.next(null);
	}

	private getProfileMappings(): Observable<Profile[]> {

		const profileMappingsUrl = this.urlProvider.serviceURL + '/schema/profiles';

		return this.http.get<Profile[]>(profileMappingsUrl);
	}

	get activeProfile() {
		return this.selectedProfile$.getValue();
	}

}
