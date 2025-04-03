import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
	ISupportedCategory
} from "../../customise-appearance/visualisation-options/supported-chart-types-service/supported-chart-types.service";

@Component({
	selector: 'app-diagram-card-component',
	templateUrl: './diagram-card-component.component.html',
	styleUrls: ['./diagram-card-component.component.less']
})
export class DiagramCardComponentComponent {

	@Input() diagram: ISupportedCategory;
	@Output() outputEvent = new EventEmitter<any>;

	constructor() { }

	categorySelect(): void {
		this.outputEvent.emit(this.diagram);
	}
}
