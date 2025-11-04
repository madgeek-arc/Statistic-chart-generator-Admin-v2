import { first, map } from 'rxjs/operators';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { DynamicEntityNode } from './entity-tree-nodes.types';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { DynamicTreeDatabase } from 'src/app/services/dynamic-tree-database/dynamic-tree-database.service';


export class DynamicDataSource implements DataSource<DynamicEntityNode> {
	dataChange = new BehaviorSubject<DynamicEntityNode[]>([]);

	private _connected$ = new BehaviorSubject<boolean>(false);
	public connected$ = this._connected$.asObservable();

	get data(): DynamicEntityNode[] {
		return this.dataChange.value;
	}
	set data(value: DynamicEntityNode[]) {
		this._treeControl.dataNodes = value;
		this.dataChange.next(value);
	}

	constructor(private _treeControl: NestedTreeControl<DynamicEntityNode>, private _database: DynamicTreeDatabase) { }

	connect(collectionViewer: CollectionViewer): Observable<DynamicEntityNode[]> {

    this._treeControl.expansionModel.changed.subscribe(
			(change: SelectionChange<DynamicEntityNode>) => { if (change.added || change.removed) this.handleTreeControl(change); }
		);

		return merge(collectionViewer.viewChange, this.dataChange).pipe(
			map(() => {
				// Make known that the Data Source is Connected
				if (!this._connected$.value)
					this._connected$.next(true);

				return this.data;
			})
		);
	}

	/** Handle expand/collapse behaviors */
	handleTreeControl(change: SelectionChange<DynamicEntityNode>) {
		if (change.added) {
			change.added.forEach(node => { this.toggleNode(node, true) });
		}
		if (change.removed) {
			change.removed
				.slice()
				.reverse()
				.forEach(node => this.toggleNode(node, false));
		}
	}

	/**
	 * Toggle the node, remove from the display list
	 */
	toggleNode(node: DynamicEntityNode, expand: boolean) {
		if (expand) {
			node.loading = true;

      const children = this._database.getChildren(node);

      if (children != null)
				children.pipe(first()).subscribe(data => { if (node.relations != null) node.relations.next(data); });

			node.loading = false;
		}
		else if (node.relations != null)
			node.relations.next([]);

		this.dataChange.next(this.data);
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this._connected$.complete();
		this._treeControl.expansionModel.changed.complete();
	}
}
