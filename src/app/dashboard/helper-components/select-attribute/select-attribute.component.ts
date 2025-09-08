import { DynamicDataSource } from './dynamic-entity-tree/dynamic-entity-tree';
import {
  DynamicEntityNode,
  EntityNode,
  EntityTreeNode,
  FieldNode
} from './dynamic-entity-tree/entity-tree-nodes.types';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewRef
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { takeWhile } from 'rxjs/operators';
import { ChartLoadingService } from "../../../services/chart-loading-service/chart-loading.service";
import { DynamicTreeDatabase } from "../../../services/dynamic-tree-database/dynamic-tree-database.service";

@Component({
  selector: 'select-attribute',
  templateUrl: './select-attribute.component.html',
  styleUrls: ['./select-attribute.component.scss'],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectAttributeComponent), multi: true }]
})

export class SelectAttributeComponent implements ControlValueAccessor, OnChanges, AfterViewInit {

  nestedEntityTreeControl: NestedTreeControl<DynamicEntityNode>;
  nestedEntityDataSource: DynamicDataSource;

  @Input() isDisabled = false;
  @Input() control: AbstractControl | null;
  @Input() chosenEntity: string | null = null;
  @Output() fieldChanged = new EventEmitter<FieldNode>();

  selectedNode: FieldNode | null = null;
  private pendingValue: FieldNode | null = null; // Store value to set later

  constructor(private chartLoadingService: ChartLoadingService,
              private cdr: ChangeDetectorRef,
              private dynamicTreeDB: DynamicTreeDatabase
  ) {

    this.nestedEntityTreeControl = new NestedTreeControl<DynamicEntityNode>(node => node.relations);
    this.nestedEntityDataSource = new DynamicDataSource(this.nestedEntityTreeControl, this.dynamicTreeDB);
  }
  /**
   * Angular callbacks
   */

  ngAfterViewInit() {
    this.registerOnChange(this.handleChange);
    this.registerOnTouched(this.handleTouch);
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['chosenEntity'];

    if (change === null || change === undefined)
      return;
    if (change.currentValue == change.previousValue)
      return;

    console.log('🏷️  Entity changed to:', change.currentValue);
    console.log('🏷️  Previous entity:', change.previousValue);

    if (this.control !== null) {
      this.control.reset();
    }

    if (this.chartLoadingService.chartLoadingStatus) {
      this.getEntityTreeNode(change.currentValue, false);
    } else {
      this.getEntityTreeNode(change.currentValue, true);
    }

    // NEW: Check if we have a control value that needs to be applied after entity change
    this.checkForPendingControlValue();
  }

  private checkForPendingControlValue() {
    setTimeout(() => {
      if (this.control && this.control.value && this.chosenEntity) {
        console.log('🔧 Found control value after entity change:', this.control.value);
        // Force writeValue to be called with the current control value
        this.writeValue(this.control.value);
      }
    }, 100);
  }


  /**
   * Mat Nested Tree related calls
   */

  hasNestedChild = (_: number, node: DynamicEntityNode) => !!node.fields || node.isExpandable;

  getEntityTreeNode(entity: string, resetSelectField?: boolean) {

    if (entity === null || entity === undefined) {

      this.nestedEntityDataSource.data = [];
      this.selectedFieldChanged(null);
      return;
    }

    if (entity !== this.chosenEntity)
      return;

    // Check if the Data Source is connected and if it is, populate the Tree Root node
    this.nestedEntityDataSource.connected$.subscribe(
      connected => {
        if (connected) {
          this.populateRootNode(entity, resetSelectField);
        }
      }
    );

    // Set the field untouched
    if (resetSelectField)
      this.selectedFieldChanged(null);
  }

  private populateRootNode(entity: string, resetSelectField: boolean | undefined) {
    this.dynamicTreeDB.getRootNode(entity)?.pipe(takeWhile(() => this.chosenEntity == entity))
      .subscribe((rootNode: DynamicEntityNode | null) => {
        console.log('🌳 Root node received for entity:', entity, rootNode);
        if (rootNode != null) {
          // Initialise the NestedTree's data
          this.nestedEntityDataSource.data = [rootNode];
          // Expand the first tree node
          if (this.nestedEntityDataSource.data.length > 0)
            this.nestedEntityTreeControl.expand(this.nestedEntityDataSource.data[0]);

          // Check for both pending value and current control value
          if (this.pendingValue) {
            console.log('🎯 Handling pending value:', this.pendingValue);
            this.handlePendingValue();
          } else if (this.control && this.control.value && this.control.value.name && this.control.value.type) {
            console.log('🎯 Found control value to apply:', this.control.value);
            // Apply the current control value
            this.selectedNode = this.control.value;
            this.expandTreeToPath(this.control.value.name);
            this.cdr.detectChanges();
          }
        }
      });
  }

  private handlePendingValue() {
    console.log('🎯 HandlePendingValue called');
    console.log('🎯 Pending value:', this.pendingValue);
    console.log('🎯 Tree data length:', this.nestedEntityDataSource.data.length);

    if (!this.pendingValue || !this.nestedEntityDataSource.data.length) {
      return;
    }

    // Expand tree nodes to show the selected path
    this.expandTreeToPath(this.pendingValue.name);

    // Set the selected node
    this.selectedNode = this.pendingValue;
    console.log('✅ Pending value applied:', this.selectedNode);
    this.pendingValue = null;

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private expandTreeToPath(fieldPath: string) {
    if (!fieldPath || !this.nestedEntityDataSource.data.length) {
      return;
    }

    const pathParts = fieldPath.split('.');
    // Remove the last part as it's the field name
    const entityPath = pathParts.slice(0, -1);

    let currentNodes = this.nestedEntityDataSource.data;

    for (const pathPart of entityPath) {
      const nodeToExpand = currentNodes.find(node => node.name === pathPart);
      if (nodeToExpand) {
        this.nestedEntityTreeControl.expand(nodeToExpand);

        // Handle relations as either BehaviorSubject or array
        if (nodeToExpand.relations) {
          if (typeof nodeToExpand.relations.subscribe === 'function') {
            // It's a BehaviorSubject, get the current value
            currentNodes = (nodeToExpand.relations as any).value || [];
          } else {
            // It's already an array
            currentNodes = nodeToExpand.relations as unknown as DynamicEntityNode[];
          }
        } else {
          currentNodes = [];
        }
      } else {
        break;
      }
    }
  }

  nodeSelected(field: FieldNode, node: DynamicEntityNode, pathOnly?: boolean) {

    const selectedFieldNode = new FieldNode();

    // Set the field to full path
    selectedFieldNode.name = this.takeFieldName(field, node);
    // selectedFieldNode.name = this.traverseParentPath(node) + '.' + field.name;
    selectedFieldNode.type = field.type;

    // Change the control into the updated value
    if (this.control !== null) {
      this.control.setValue(selectedFieldNode);
    }
    console.log(this.control);
    this.selectedNode = selectedFieldNode;

    // Emit the event that the field value has changed
    this.fieldChanged.emit(selectedFieldNode);
  }

  /**
   * Utility calls
   */
  takeFieldName(field: FieldNode, node: DynamicEntityNode): string {
    var parentPath = '';
    node.path.map((nodeName: string) => {
      if (parentPath.length > 0)
        parentPath = parentPath + '.' + nodeName;
      else
        parentPath = nodeName;
    });
    return parentPath + '.' + field.name;
  }
  trackByFieldName(index: number, item: FieldNode) { return item.name; }

  public checkValidFieldNode(e: FieldNode | null) {

    if (e !== null && (e.name && e.type)) return e;

    return null;
  }

  traverseParentPath(node: EntityTreeNode): string {
    if (node.parent === null)
      return node.name;

    return this.traverseParentPath(node.parent) + '.' + node.name;
  }

  // Method checking if two Nodes are the same
  compareEntityNodes(prev: EntityNode, curr: EntityNode): boolean {
    if (prev == null && curr == null) return true;

    if (prev.name !== curr.name) return false;
    if (prev.relations.length != curr.relations.length) return false;

    for (let index = 0; index < prev.relations.length; index++) {
      if (prev.relations[index].name !== curr.relations[index].name)
        return false;
    }

    if (prev.fields.length != curr.fields.length) return false;

    for (let index = 0; index < prev.fields.length; index++) {
      if (prev.fields[index].name !== curr.fields[index].name)
        return false;
    }

    return true;
  }
  /**
   * Value Accessor related calls
   */

  _onChange = (arg: any) => { };
  _onTouched = (arg: boolean) => { };

  handleChange(arg: FieldNode) {
    if (this.checkValidFieldNode(arg) !== null) {
      if (this.control !== null) {
        this.control.markAsDirty();
      }
    }
  }
  handleTouch(opened: boolean) {
    if (!opened) {
      if (this.control !== null) {
        this.control.markAsTouched();
      }
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  // Writes a new value from the form model into the view or (if necessary) DOM property.
  writeValue(value: FieldNode) {
    console.log('🔄 WriteValue called with:', value);
    console.log('🔄 Tree data ready:', !!this.nestedEntityDataSource.data.length);
    console.log('🔄 Chosen entity:', this.chosenEntity);

    // Check for valid field node - be more permissive about what we consider valid
    const isValidValue = value &&
      typeof value === 'object' &&
      (value.name !== null && value.name !== undefined && value.name !== '') &&
      (value.type !== null && value.type !== undefined && value.type !== '');

    if (isValidValue) {
      // If tree data is not ready yet, store the value to set later
      if (!this.nestedEntityDataSource.data.length || !this.chosenEntity) {
        console.log('⏳ Tree not ready, storing pending value:', value);
        this.pendingValue = value;
      } else {
        // Tree is ready, set the value immediately
        console.log('✅ Tree ready, setting value immediately:', value);
        this.selectedNode = value;
        this.expandTreeToPath(value.name);
      }

      if (this.cdr !== null && this.cdr !== undefined && !(this.cdr as ViewRef).destroyed) {
        this.cdr.detectChanges();
      }
    } else {
      console.log('❌ Invalid field node, clearing selection. Value was:', value);
      this.selectedNode = null;
      this.pendingValue = null;
    }
  }


  // Method that calls the registered onChange method
  selectedFieldChanged(value: FieldNode | null) {

    this.selectedNode = value;
    this._onChange(value);

    // console.log('Field changed to: %s from: %s',
    //  (value === null ? null : '{' + value.name + ' , ' + value.type + '}'),
    //  (this.selectedNode === null ? null : '{' + this.selectedNode.name + ' , ' + this.selectedNode.type + '}'));

  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.cdr && !(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }
}
