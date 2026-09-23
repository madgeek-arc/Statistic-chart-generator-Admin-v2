import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/input.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { refreshOnFormChanges } from '../../../../shared/refresh-on-form-changes';

@Component({
    selector: 'app-google-charts',
    templateUrl: './google-charts.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, InputComponent, MatSlideToggle, MatIcon]
})
export class GoogleChartsComponent {

	readonly googleChartsForm = input<FormGroup>(undefined);

	protected stackedGraphList = [
		{ label: 'Disabled', value: 'disabled' },
		{ label: 'Stacked by Value', value: 'stackedByValue' },
		{ label: 'Stacked by Percentage', value: 'stackedByPercentage' }
	];

	constructor() {
		refreshOnFormChanges(this.googleChartsForm);
	}

}
