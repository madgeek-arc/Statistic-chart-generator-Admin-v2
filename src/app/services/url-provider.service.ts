import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class UrlProviderService {

	constructor() { }

	get serviceURL(): string {
		return environment.apiUrl + environment.apiFolder;
	}

}
