import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-card-component',
	templateUrl: './card-component.component.html',
	styleUrls: ['./card-component.component.less']
})
export class CardComponentComponent {

	@Input() data: any = {};
	@Output() outputEvent = new EventEmitter<any>;

	constructor() { }

	viewSelect() {
		this.outputEvent.emit(this.data);
	}
}
