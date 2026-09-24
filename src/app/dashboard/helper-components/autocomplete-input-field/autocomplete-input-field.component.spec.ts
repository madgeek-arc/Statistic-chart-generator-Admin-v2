import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { AutocompleteInputFieldComponent } from './autocomplete-input-field.component';
import {
  AutocompleteResponse,
  FieldAutocompleteService
} from '../../../services/field-autocomplete-service/field-autocomplete.service';

describe('AutocompleteInputFieldComponent', () => {
  let fixture: ComponentFixture<AutocompleteInputFieldComponent>;
  let component: AutocompleteInputFieldComponent;
  let getAutocompleteFields: jasmine.Spy;

  beforeEach(() => {
    getAutocompleteFields = jasmine.createSpy('getAutocompleteFields');
    TestBed.configureTestingModule({
      imports: [AutocompleteInputFieldComponent],
      providers: [{ provide: FieldAutocompleteService, useValue: { getAutocompleteFields } }]
    });
    fixture = TestBed.createComponent(AutocompleteInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputFormGroup', new FormControl(''));
    fixture.componentRef.setInput('filterfield', 'dataset.publisher');
    fixture.detectChanges();
  });

  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

  function type(text: string): void {
    input().value = text;
    input().dispatchEvent(new KeyboardEvent('keyup'));
    tick(component.typeToSearchDelay);
  }

  const possibleValues = () => component.possibleFieldValues();

  // An empty backend body reaches the component as `null`, and reading
  // `result.count` used to throw before `loading` was reset.
  it('treats an empty (null) backend response as no matches instead of throwing', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of(null));

    type('ela');

    expect(possibleValues()).toEqual([]);
    expect(component.numberOfpossibleFieldValues()).toBe(0);
    expect(component.loading()).toBeFalse();
  }));

  it('exposes the values returned by the backend', fakeAsync(() => {
    const response: AutocompleteResponse = { count: 2, values: ['Zenodo', 'Elsevier'] };
    getAutocompleteFields.and.returnValue(of(response));

    type('e');

    expect(possibleValues()).toEqual(['Zenodo', 'Elsevier']);
    expect(component.numberOfpossibleFieldValues()).toBe(2);
    expect(component.loading()).toBeFalse();
  }));

  // The endpoint omits `values` for high-cardinality fields; the template must
  // show "type to narrow down" (values === null), not crash or say "No results".
  it('flags a response with a count but no values as "too many values"', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of({ count: 121 } as unknown as AutocompleteResponse));

    type('20');

    expect(possibleValues()).toBeNull();
    expect(component.numberOfpossibleFieldValues()).toBe(121);
    expect(component.loading()).toBeFalse();
  }));

  // Focusing the box fetches the available values straight away (empty query).
  it('looks up values as soon as the input is focused, without typing', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of({ count: 1, values: ['Zenodo'] }));

    input().dispatchEvent(new Event('focus'));
    tick();

    expect(getAutocompleteFields).toHaveBeenCalledWith('dataset.publisher', null);
    expect(possibleValues()).toEqual(['Zenodo']);
  }));

  it('shows a "could not fetch" state and stops loading when the request fails', fakeAsync(() => {
    spyOn(console, 'error');
    getAutocompleteFields.and.returnValue(throwError(() => new Error('boom')));

    type('ela');

    expect(component.numberOfpossibleFieldValues()).toBe(-1);
    expect(component.loading()).toBeFalse();
    expect(component.searched()).toBeTrue();
  }));

  // Values fetched for the previous field must not leak into the new one.
  it('resets its state and searches the new field when the filter field changes', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of({ count: 1, values: ['Zenodo'] }));
    type('z');
    expect(component.searched()).toBeTrue();

    fixture.componentRef.setInput('filterfield', 'dataset.year');
    fixture.detectChanges();

    expect(component.searched()).toBeFalse();
    expect(component.panelReady()).toBeFalse();
    expect(possibleValues()).toEqual([]);

    getAutocompleteFields.calls.reset();
    getAutocompleteFields.and.returnValue(of({ count: 1, values: ['2020'] }));
    type('2');

    expect(getAutocompleteFields).toHaveBeenCalledWith('dataset.year', '2');
  }));
});

// What the user sees, with the field inside a parent as on the dashboard. The lookups finish
// outside any event in this component, and the control can be disabled from elsewhere in the
// form, so the field must refresh its own view.
@Component({
  template: `<autocomplete-input-field [inputFormGroup]="control" filterfield="dataset.publisher"/>`,
  imports: [AutocompleteInputFieldComponent]
})
class HostComponent {
  control = new FormControl('');
}

describe('AutocompleteInputFieldComponent rendered', () => {
  let fixture: ComponentFixture<HostComponent>;
  let getAutocompleteFields: jasmine.Spy;

  beforeEach(() => {
    getAutocompleteFields = jasmine.createSpy('getAutocompleteFields');
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: FieldAutocompleteService, useValue: { getAutocompleteFields } }]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const panelText = () => document.querySelector('.mat-mdc-autocomplete-panel')?.textContent ?? '';

  // Answers arrive after the lookup starts, as over HTTP.
  const respond = (response: AutocompleteResponse) =>
    getAutocompleteFields.and.returnValue(of(response).pipe(delay(100)));

  function type(text: string): void {
    input().value = text;
    input().dispatchEvent(new KeyboardEvent('keyup'));
    tick(250);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
  }

  const openPanel = () => {
    fixture.debugElement.query(el => !!el.injector.get(MatAutocompleteTrigger, null)).injector
      .get(MatAutocompleteTrigger).openPanel();
    fixture.detectChanges();
  };

  it('lists the values of each lookup in the open panel', fakeAsync(() => {
    respond({ count: 2, values: ['Zenodo', 'Elsevier'] });
    type('e');
    openPanel();
    expect(panelText()).toContain('Zenodo');

    respond({ count: 1, values: ['Springer'] });
    type('sp');

    expect(panelText()).toContain('Springer');
    expect(panelText()).not.toContain('Zenodo');
    tick();
  }));

  it('says so when a field has too many values to list', fakeAsync(() => {
    respond({ count: 121 } as unknown as AutocompleteResponse);
    type('2');
    openPanel();

    expect(panelText()).toContain('Too many values');
    tick();
  }));

  it('greys out when its control is disabled elsewhere in the form', () => {
    const wrapper = (): HTMLElement => fixture.nativeElement.querySelector('.input-wrapper');
    expect(wrapper().classList).not.toContain('disabled');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(wrapper().classList).toContain('disabled');
  });
});

describe('AutocompleteInputFieldComponent teardown', () => {
  // The lookup subscription only exists after ngAfterViewInit, so a component
  // destroyed before its first change detection has nothing to unsubscribe.
  it('can be destroyed before its view is initialized', () => {
    TestBed.configureTestingModule({
      imports: [AutocompleteInputFieldComponent],
      providers: [{ provide: FieldAutocompleteService, useValue: { getAutocompleteFields: () => of(null) } }]
    });
    const fixture = TestBed.createComponent(AutocompleteInputFieldComponent);

    expect(() => fixture.destroy()).not.toThrow();
  });
});
