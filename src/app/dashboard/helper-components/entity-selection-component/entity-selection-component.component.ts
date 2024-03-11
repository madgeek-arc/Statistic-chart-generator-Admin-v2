import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CachedEntityNode } from '../../dataseries-selector/dataseries-selector.component';
import { MatSelectChange } from '@angular/material/select';

@Component({
	selector: 'app-entity-selection-component',
	templateUrl: './entity-selection-component.component.html',
	styleUrls: ['./entity-selection-component.component.less']
})
export class EntitySelectionComponentComponent implements OnInit {

	@Input() entityMap: Map<string, CachedEntityNode> = new Map<string, CachedEntityNode>(new Map<string, CachedEntityNode>());
	@Input() entityFieldRelation: any;

	@Output() outputEvent = new EventEmitter<any>;

	protected selectedEntityMap: Array<CachedEntityNode> = [];
	panelOpenState: boolean = false;
	namePath: any = {};

	constructor() { }

	ngOnInit(): void {
		console.log("EntitySelectionComponentComponent - entityMap:", this.entityMap);
		console.log("EntitySelectionComponentComponent - entityFieldRelation:", this.entityFieldRelation);

		this.selectedEntityMap = Array.from(this.entityMap.values()).filter((item: any) => {
			if (item.name === this.entityFieldRelation) {
				return item;
			}
		});
	}

	entityFieldSelect(entityFieldName: string): void {
		console.log("entityFieldSelect - entityFieldName:", entityFieldName);

		this.outputEvent.emit(
			{
				entityFieldName: entityFieldName,
				path: `${this.selectedEntityMap[0].name}` + (this.namePath.path ? " - " + this.namePath.path : "")
			}
		);
	}

	outputResult(event: any): void {
		this.namePath = {
			name: event.name,
			path: event.path
		}
	}

}
