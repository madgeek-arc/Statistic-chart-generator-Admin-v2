import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

	views: Array<any> = [];

	loading: boolean = false;
	headerText: string = '';
	changeWarningButtonText: string = "Change Warning Text";
	getProfilesText: string = "Get Profiles";

	constructor(
		private http: HttpClient
	) { }


	ngOnInit(): void {
		this.headerText = 'Loading...';

		setTimeout(() => {
			this.getProfiles();
		}, 3000);
	}

	protected getProfiles() {
		const sub = this.getProfileMappings().subscribe({
			next: (resutls: any) => {
				console.log("Resutls:", resutls)
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

	private getProfileMappings(): Observable<Array<any>> {
		const url = environment.apiUrl + environment.apiFolder + '/schema/profiles'

		return this.http.get<Array<any>>(url);
	}

}
