import { BehaviorSubject } from 'rxjs';

export class DynamicEntityNode {
	fields: FieldNode[];
	name: string;
	isExpandable: boolean;
	path: string[];
	relations?: BehaviorSubject<DynamicEntityNode[]>;
	parent?: DynamicEntityNode;
	loading: boolean;

	constructor(fields: FieldNode[], name: string, path: string[],
		relations?: BehaviorSubject<DynamicEntityNode[]>, parent?: DynamicEntityNode, loading = false) {

		this.fields = fields;
		this.name = name;

		this.path = path;
		this.path.push(name);

		if (relations != null)
			this.relations = relations;
		else
			this.relations = new BehaviorSubject<DynamicEntityNode[]>([]);

		this.parent = parent;
		this.loading = loading;
	}


	public get isExpendable(): boolean {
		return (this.relations != null && this.relations.value != null && this.relations.value.length > 0)
	}

}

export class EntityTreeNode {
	fields: FieldNode[];
	relations: EntityTreeNode[];
	name: string;
	parent: EntityTreeNode;

	constructor(fields?: FieldNode[], relations?: EntityTreeNode[], name?: string, parent?: EntityTreeNode) {
		this.fields = fields!;
		this.relations = relations!;
		this.name = name!;
		this.parent = parent!;
	}
}

export class EntityNode {
	fields: FieldNode[];
	relations: EntityNode[];
	name: string;
}
export class CachedEntityNode {
	fields: FieldNode[];
	relations: string[];
	name: string;
}
export class FieldNode {
	name: string;
	type: string;
}