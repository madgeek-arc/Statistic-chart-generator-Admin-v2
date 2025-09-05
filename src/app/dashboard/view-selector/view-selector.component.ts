import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProfileProviderService } from 'src/app/services/profile-provider/profile-provider.service';
import { ViewSavingService } from 'src/app/services/view-saving-service/view-saving.service';

@Component({
	selector: 'app-view-selector',
	templateUrl: './view-selector.component.html',
	styleUrls: ['./view-selector.component.less']
})
export class ViewSelectorComponent {

	@Input() viewForm: FormControl = new FormControl();
	@Input() profileControl?: FormControl;
	@Output() showViewSelection = new EventEmitter<any>;

	constructor(
		protected profileProvide: ProfileProviderService,
		private viewSavingService: ViewSavingService
	) { }

	moveToNextStep(event: any): void {
		if (event.name) {
			this.viewForm.setValue(event);
			this.viewSavingService.setTestingView(event);
			this.profileControl?.setValue(event.name, {onlySelf: false, emitEvent: true});
      console.log('profileControl -------------------> ', this.profileControl);
      console.log(this.profileControl?.value);
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
