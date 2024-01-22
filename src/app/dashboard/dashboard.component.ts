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

	@Input() myData: string = '';

	warning: boolean = false;
	warningText: string = '';
	changeWarningButtonText: string = "Change Warning Text";
	getProfilesText: string = "Get Profiles";

	constructor(
		private http: HttpClient
	) { }


	ngOnInit(): void {
		console.log("My Data:", this.myData);
		this.warningText = 'Warning';

		setTimeout(() => {
			this.warning = true;
		}, 3000);
	}

	changeWarningText(): void {
		if (this.warningText === 'Warning') {
			this.warningText = 'DO NOT PRESS';
		} else {
			this.warningText = 'Warning';
		}
	}

	protected getProfiles() {
		const sub = this.getProfileMappings().subscribe(resutls => {
			console.log("Resutls:", resutls)
		});
	}

	private getProfileMappings(): Observable<Array<any>> {
		const url = environment.apiUrl + environment.apiFolder + '/schema/profiles'

		return this.http.get<Array<any>>(url);
	}

}
