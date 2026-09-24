import { DynamicDataSource } from './dynamic-entity-tree/dynamic-entity-tree';
import {
  DynamicEntityNode,
  FieldNode
} from './dynamic-entity-tree/entity-tree-nodes.types';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  forwardRef,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  signal
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { filter, take, takeWhile } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartLoadingService } from "../../../services/chart-loading-service/chart-loading.service";
import { DynamicTreeDatabase } from "../../../services/dynamic-tree-database/dynamic-tree-database.service";
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { MatTree, MatTreeNodeDef, MatNestedTreeNode, MatTreeNodeToggle, MatTreeNodeOutlet } from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'select-attribute',
    templateUrl: './select-attribute.component.html',
    styleUrls: ['./select-attribute.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [
        { provide: ControlContainer, useExisting: FormGroupDirective }
    ],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectAttributeComponent), multi: true }],
    imports: [MatButton, MatMenuTrigger, MatMenu, MatTree, MatTreeNodeDef, MatNestedTreeNode, MatTreeNodeToggle, MatIconButton, MatIcon, MatProgressBar, MatTreeNodeOutlet, TitleCasePipe]
})

export class SelectAttributeComponent implements ControlValueAccessor, OnChanges, AfterViewInit {
  private chartLoadingService = inject(ChartLoadingService);
  private destroyRef = inject(DestroyRef);
  private dynamicTreeDB = inject(DynamicTreeDatabase);

  nestedEntityTreeControl: NestedTreeControl<DynamicEntityNode>;
  nestedEntityDataSource: DynamicDataSource;

  readonly isDisabled = signal(false);
  readonly formControl = input<AbstractControl | null>(undefined, { alias: 'formInput' });
  readonly chosenEntity = input<string | null>(null);

  readonly selectedNode = signal<FieldNode | null>(null);
  private pendingValue: FieldNode | null = null; // Store value to set later

  constructor() {

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
    const formControl = this.formControl();
    const change = changes['chosenEntity'];

    if (change === null || change === undefined)
      return;
    if (change.currentValue == change.previousValue)
      return;

    if (formControl !== null && formControl !== undefined && change.previousValue !== undefined) {
      formControl.reset();
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
      const formControl = this.formControl();
      if (formControl && formControl.value && this.chosenEntity()) {
        // Force writeValue to be called with the current control value
        this.writeValue(formControl.value);
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

    if (entity !== this.chosenEntity())
      return;

    // Once the Data Source is connected, populate the Tree Root node. It only ever connects once,
    // so a single emission is enough and nothing stays subscribed after an entity change.
    this.nestedEntityDataSource.connected$.pipe(filter(connected => connected), take(1)).subscribe(
      () => this.populateRootNode(entity)
    );

    // Set the field untouched
    if (resetSelectField)
      this.selectedFieldChanged(null);
  }

  private populateRootNode(entity: string) {
    this.dynamicTreeDB.getRootNode(entity)?.pipe(takeWhile(() => this.chosenEntity() == entity), takeUntilDestroyed(this.destroyRef))
      .subscribe((rootNode: DynamicEntityNode | null) => {
        if (rootNode != null) {
          // Initialise the NestedTree's data
          this.nestedEntityDataSource.data = [rootNode];
          // Expand the first tree node
          if (this.nestedEntityDataSource.data.length > 0)
            this.nestedEntityTreeControl.expand(this.nestedEntityDataSource.data[0]);

          // Check for both pending value and current control value
          const formControl = this.formControl();
          if (this.pendingValue) {
            this.handlePendingValue();
          } else if (formControl && formControl.value && formControl.value.name && formControl.value.type) {
            // Apply the current control value
            this.selectedNode.set(formControl.value);
            this.expandTreeToPath(formControl.value.name);
          }
        }
      });
  }

  private handlePendingValue() {
    if (!this.pendingValue || !this.nestedEntityDataSource.data.length) {
      return;
    }

    // Expand tree nodes to show the selected path
    this.expandTreeToPath(this.pendingValue.name);

    // Set the selected node
    this.selectedNode.set(this.pendingValue);
    this.pendingValue = null;
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
            currentNodes = nodeToExpand.relations.value || [];
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

  nodeSelected(field: FieldNode, node: DynamicEntityNode, _pathOnly?: boolean) {

    const selectedFieldNode = new FieldNode();

    // Set the field to full path
    selectedFieldNode.name = this.takeFieldName(field, node);
    selectedFieldNode.type = field.type;

    // Change the control into the updated value
    const formControl = this.formControl();
    if (formControl) {
      formControl.setValue(selectedFieldNode);
    }

    this.selectedNode.set(selectedFieldNode);
  }

  /**
   * Utility calls
   */
  takeFieldName(field: FieldNode, node: DynamicEntityNode): string {
    let parentPath = '';
    node.path.map((nodeName: string) => {
      if (parentPath.length > 0)
        parentPath = parentPath + '.' + nodeName;
      else
        parentPath = nodeName;
    });
    return parentPath + '.' + field.name;
  }

  public checkValidFieldNode(e: FieldNode | null) {

    if (e !== null && (e.name && e.type)) return e;

    return null;
  }

  /**
   * Value Accessor related calls
   */

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- ControlValueAccessor stub, replaced by registerOnChange
  _onChange = (_arg: unknown) => { };
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- ControlValueAccessor stub, replaced by registerOnTouched
  _onTouched = (_arg: boolean) => { };

  handleChange(arg: FieldNode) {
    if (this.checkValidFieldNode(arg) !== null) {
      const formControl = this.formControl();
      if (formControl !== null) {
        formControl.markAsDirty();
      }
    }
  }

  handleTouch(opened: boolean) {
    if (!opened) {
      const formControl = this.formControl();
      if (formControl !== null) {
        formControl.markAsTouched();
      }
    }
  }

  registerOnChange(fn: (_: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: (_arg: boolean) => void): void {
    this._onTouched = fn;
  }

  // Writes a new value from the form model into the view or (if necessary) DOM property.
  writeValue(value: FieldNode) {
    const chosenEntity = this.chosenEntity();

    // Check for valid field node - be more permissive about what we consider valid
    const isValidValue = value &&
      typeof value === 'object' &&
      (value.name !== null && value.name !== undefined && value.name !== '') &&
      (value.type !== null && value.type !== undefined && value.type !== '');

    if (isValidValue) {
      // If tree data is not ready yet, store the value to set later
      if (!this.nestedEntityDataSource.data.length || !chosenEntity) {
        this.pendingValue = value;
      } else {
        // Tree is ready, set the value immediately
        this.selectedNode.set(value);
        this.expandTreeToPath(value.name);
      }
    } else {
      this.selectedNode.set(null);
      this.pendingValue = null;
    }
  }


  // Method that calls the registered onChange method
  selectedFieldChanged(value: FieldNode | null) {

    this.selectedNode.set(value);
    this._onChange(value);

  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

}
