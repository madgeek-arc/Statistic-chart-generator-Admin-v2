import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-e-charts',
  templateUrl: './e-charts.component.html',
  styleUrls: ['./e-charts.component.less']
})
export class EChartsComponent {

	@Input('eChartsForm') eChartsForm: FormGroup;


}
