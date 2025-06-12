import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ViewSavingService {
	view: any = {};

	constructor() { }

	getTestingView(): any {
		return this.view
	}

	setTestingView(data: any) {
		this.view = data;
	}
}
