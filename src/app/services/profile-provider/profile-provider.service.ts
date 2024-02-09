import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, retry } from 'rxjs';
import { UrlProviderService } from '../url-provider/url-provider.service';

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
export class ProfileProviderService {
	mappingProfiles$: BehaviorSubject<Array<Profile>>;

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService,
		//  private errorHandler: ErrorHandlerService
	) {
		this.mappingProfiles$ = new BehaviorSubject<Array<Profile>>([]);

		const sub = this.getProfileMappings().subscribe({
			next: (results: Profile[]) => {
				this.mappingProfiles$.next(results);
			},
			error: (error: any) => {
				console.log("Error:", error)
				// errorHandler.handleError(err);
			},
			complete: () => {
				sub.unsubscribe();
			}
		});

	}

	getProfileMappings(): Observable<Array<Profile>> {
		const supportedProfiles = this.urlProvider.serviceURL + '/schema/profiles'

		return this.http.get<Array<any>>(supportedProfiles)
			.pipe(
				retry(3)
				// catchError
			);
	}

}

