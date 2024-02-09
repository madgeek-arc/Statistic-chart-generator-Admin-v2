import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { EntityProviderService } from 'src/app/services/entity-provider/entity-provider.service';
import { Profile } from 'src/app/services/profile-provider/profile-provider.service';

@Component({
	selector: 'app-dataseries-selector',
	templateUrl: './dataseries-selector.component.html',
	styleUrls: ['./dataseries-selector.component.less']
})
export class DataseriesSelectorComponent implements OnInit {

	@Input('dataseriesForm') dataseriesForm: FormGroup;
	@Input('selectedView') selectedView: FormControl = new FormControl;

	testingSelect: string = '';

	entities: Array<string> = [];

	entitySelection: string = 'Select Entity';

	constructor(
		private formBuilder: FormBuilder,
		private entityProvider: EntityProviderService
	) {
		this.dataseriesForm = new FormGroup({
			entity: this.formBuilder.control(null, Validators.required)
		})
	}

	get entity(): FormControl {
		return this.dataseriesForm.get('entity') as FormControl;
	}

	ngOnInit(): void {
		console.log("DataseriesSelector ngOnInit");
		this.selectedView.valueChanges.subscribe((view: Profile) => {
			if (view) {
				this.entityProvider.getAvailableEntities(view).pipe(distinctUntilChanged()).subscribe((entities: Array<string>) => {
					console.log("Entities:", entities);
					this.entities = entities;
				})
			}
		});
	}

	selectEntity(entity: string): void {
		this.dataseriesForm.get('entity')?.setValue(entity);
	}

	testLog(): void {
		console.log("this.dataseriesForm.get('entity'):", this.dataseriesForm.get('entity')?.value);
	}

	someMethod(event: any): void {
		this.dataseriesForm.get('entity')?.setValue(event.value);
	}
}
