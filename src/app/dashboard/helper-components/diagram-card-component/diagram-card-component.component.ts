import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-diagram-card-component',
	templateUrl: './diagram-card-component.component.html',
	styleUrls: ['./diagram-card-component.component.less']
})
export class DiagramCardComponentComponent {

	@Input() diagramName: string | undefined = '';

	constructor() { }
}
