import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';

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

  function possibleValues(): string[] | null | undefined {
    let values: string[] | null | undefined;
    component.possibleFieldValues.subscribe(v => values = v);
    return values;
  }

  // An empty backend body reaches the component as `null`, and reading
  // `result.count` used to throw before `loading` was reset.
  it('treats an empty (null) backend response as no matches instead of throwing', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of(null));

    type('ela');

    expect(possibleValues()).toEqual([]);
    expect(component.numberOfpossibleFieldValues).toBe(0);
    expect(component.loading).toBeFalse();
  }));

  it('exposes the values returned by the backend', fakeAsync(() => {
    const response: AutocompleteResponse = { count: 2, values: ['Zenodo', 'Elsevier'] };
    getAutocompleteFields.and.returnValue(of(response));

    type('e');

    expect(possibleValues()).toEqual(['Zenodo', 'Elsevier']);
    expect(component.numberOfpossibleFieldValues).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  // The endpoint omits `values` for high-cardinality fields; the template must
  // show "type to narrow down" (values === null), not crash or say "No results".
  it('flags a response with a count but no values as "too many values"', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of({ count: 121 } as unknown as AutocompleteResponse));

    type('20');

    expect(possibleValues()).toBeNull();
    expect(component.numberOfpossibleFieldValues).toBe(121);
    expect(component.loading).toBeFalse();
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

    expect(component.numberOfpossibleFieldValues).toBe(-1);
    expect(component.loading).toBeFalse();
    expect(component.searched).toBeTrue();
  }));

  // Values fetched for the previous field must not leak into the new one.
  it('resets its state and searches the new field when the filter field changes', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of({ count: 1, values: ['Zenodo'] }));
    type('z');
    expect(component.searched).toBeTrue();

    fixture.componentRef.setInput('filterfield', 'dataset.year');
    fixture.detectChanges();

    expect(component.searched).toBeFalse();
    expect(component.panelReady).toBeFalse();
    expect(possibleValues()).toEqual([]);

    getAutocompleteFields.calls.reset();
    getAutocompleteFields.and.returnValue(of({ count: 1, values: ['2020'] }));
    type('2');

    expect(getAutocompleteFields).toHaveBeenCalledWith('dataset.year', '2');
  }));
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
