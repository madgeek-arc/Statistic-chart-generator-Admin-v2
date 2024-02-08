import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable, catchError, retry } from 'rxjs';
import { UrlProviderService } from 'src/app/services/url-provider/url-provider.service';
import { environment } from 'src/environments/environment.prod';

@Component({
	selector: 'app-view-selector',
	templateUrl: './view-selector.component.html',
	styleUrls: ['./view-selector.component.less']
})
export class ViewSelectorComponent {

	@Output() showViewSelection = new EventEmitter<string>;
	views: Array<any> = [];

	loading: boolean = false;
	headerText: string = '';
	changeWarningButtonText: string = "Change Warning Text";
	getProfilesText: string = "Get Profiles";

	isLinear: boolean = true;

	constructor(
		private http: HttpClient,
		private urlProvider: UrlProviderService
	) { }


	ngOnInit(): void {
		this.headerText = 'Loading...';

		this.getProfiles();
	}



	protected getProfiles() {
		const sub = this.getProfileMappings().subscribe({
			next: (resutls: any) => {
				this.views = resutls;
				this.loading = true;
				this.headerText = '';
			},
			error: (error: any) => {
				console.log("Error:", error)
				this.headerText = 'Error Getting Data';
			}
		});

	}

	// Possibly put in service 
	private getProfileMappings(): Observable<Array<any>> {
		const supportedProfiles = this.urlProvider.serviceURL + '/schema/profiles'

		return this.http.get<Array<any>>(supportedProfiles)
			.pipe(
				retry(3)
				// catchError
			);
	}

	moveToNextStep(event: any): void {
		if (event.name) {
			this.showViewSelection.emit(event.name)
		} else {
			this.showViewSelection.emit("PlaceHolder")
		}
	}
}
