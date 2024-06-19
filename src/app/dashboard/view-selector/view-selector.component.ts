import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProfileProviderService } from 'src/app/services/profile-provider/profile-provider.service';

@Component({
	selector: 'app-view-selector',
	templateUrl: './view-selector.component.html',
	styleUrls: ['./view-selector.component.less']
})
export class ViewSelectorComponent {

	@Input('viewForm') viewForm: FormControl = new FormControl();
	@Input('profileControl') profileControl: FormControl = new FormControl();
	@Output() showViewSelection = new EventEmitter<any>;

	isLinear: boolean = true;

	constructor(
		protected profileProvide: ProfileProviderService
	) { }


	ngOnInit(): void { }


	moveToNextStep(event: any): void {
		if (event.name) {
			this.viewForm.setValue(event);
			this.profileControl.setValue(event.name);
			this.showViewSelection.emit({
				name: event.name,
				step: "profile"
			});
		} else {
			this.showViewSelection.emit({
				name: "PlaceHolder Profile",
				step: "profile"
			});
		}
	}
}
