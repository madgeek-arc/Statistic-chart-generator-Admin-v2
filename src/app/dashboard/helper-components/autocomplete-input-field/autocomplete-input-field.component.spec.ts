import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';

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
    component.inputFormGroup = new FormControl('');
    component.filterfield = 'dataset.publisher';
    fixture.detectChanges();
  });

  function type(text: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = text;
    input.dispatchEvent(new KeyboardEvent('keyup'));
    tick(component.typeToSearchDelay);
  }

  // Regression test: an empty backend body reaches the component as `null`, and
  // reading `result.count` used to throw before `loading` was reset.
  it('treats an empty (null) backend response as no matches instead of throwing', fakeAsync(() => {
    getAutocompleteFields.and.returnValue(of(null));

    type('ela');

    expect(component.numberOfpossibleFieldValues).toBe(0);
    expect(component.loading).toBeFalse();
  }));

  it('exposes the values returned by the backend', fakeAsync(() => {
    const response: AutocompleteResponse = { count: 2, values: ['Zenodo', 'Elsevier'] };
    getAutocompleteFields.and.returnValue(of(response));

    type('e');

    let values: string[] | undefined;
    component.possibleFieldValues.subscribe(v => values = v);
    expect(values).toEqual(['Zenodo', 'Elsevier']);
    expect(component.numberOfpossibleFieldValues).toBe(2);
    expect(component.loading).toBeFalse();
  }));
});
