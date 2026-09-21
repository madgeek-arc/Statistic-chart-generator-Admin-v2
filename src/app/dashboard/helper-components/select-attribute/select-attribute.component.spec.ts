import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { SelectAttributeComponent } from './select-attribute.component';
import { DynamicEntityNode, FieldNode } from './dynamic-entity-tree/entity-tree-nodes.types';

@Component({
    template: `<select-attribute [formInput]="control" [chosenEntity]="null"
                                 (fieldChanged)="emitted = $event"></select-attribute>`,
    imports: [SelectAttributeComponent]
})
class HostComponent {
  control = new FormControl<FieldNode | null>(null);
  emitted: FieldNode | null = null;
}

describe('SelectAttributeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent]
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  // Regression test for a naming collision: SelectAttributeComponent's own
  // @Input used to be named `formControl` with no alias, which matches
  // Angular's built-in ReactiveFormsModule FormControlDirective selector
  // ([formControl]). Both directives activated on the same element, and the
  // built-in one threw `control.registerOnChange is not a function`.
  it('wires up via [formInput] without throwing', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('propagates a selected field to the bound FormControl', () => {
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as SelectAttributeComponent;

    const field = new FieldNode();
    field.name = 'title';
    field.type = 'string';
    const node = new DynamicEntityNode([], 'dataset', []);

    component.nodeSelected(field, node);

    expect(host.control.value?.name).toBe('dataset.title');
    expect(host.control.value?.type).toBe('string');
  });

  it('emits fieldChanged to a listener on the host when a field is selected', () => {
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as SelectAttributeComponent;
    const field = new FieldNode();
    field.name = 'title';
    field.type = 'string';

    component.nodeSelected(field, new DynamicEntityNode([], 'dataset', []));

    expect(host.emitted?.name).toBe('dataset.title');
    expect(host.emitted?.type).toBe('string');
  });
});
