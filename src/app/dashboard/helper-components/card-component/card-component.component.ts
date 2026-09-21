import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-card-component',
    templateUrl: './card-component.component.html',
    imports: [MatIcon]
})
export class CardComponentComponent {

	@Input() data: any = {};
	@Output() outputEvent = new EventEmitter<any>;

	constructor() { }

	viewSelect() {
		this.outputEvent.emit(this.data);
	}
}
