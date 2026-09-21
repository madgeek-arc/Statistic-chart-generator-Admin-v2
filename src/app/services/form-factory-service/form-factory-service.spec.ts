import { TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';

import { FormFactoryService } from './form-factory-service';

describe('FormFactoryService filter rules', () => {
  let factory: FormFactoryService;

  const valuesOf = (rule: FormGroup) => rule.get('values') as FormArray;
  const rule = (type: string, values: (string | null)[], fieldName = 'dataset.publisher') =>
    factory.createFilterRuleGroup({ field: { name: fieldName, type: 'text' }, type, values });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    factory = TestBed.inject(FormFactoryService);
  });

  it('keeps several values for in / not_in and trims to one for single-value operators', () => {
    const r = rule('in', ['a', 'b', 'c']);
    expect(valuesOf(r).length).toBe(3);

    r.get('type').setValue('not_in');
    expect(valuesOf(r).length).toBe(3);

    r.get('type').setValue('=');
    expect(valuesOf(r).length).toBe(1);
    expect(valuesOf(r).at(0).value).toBe('a');
  });

  it('clears the picked value(s) when the filter field changes', () => {
    const r = rule('in', ['a', 'b', 'c']);

    r.get('field.name').setValue('dataset.year');

    expect(valuesOf(r).length).toBe(1);
    expect(valuesOf(r).at(0).value).toBeNull();
  });

  it('does not clear the value when the same field is selected again', () => {
    const r = rule('=', ['a']);
    r.get('field.name').setValue('dataset.year');
    valuesOf(r).at(0).setValue('2020');

    r.get('field.name').setValue('dataset.year');

    expect(valuesOf(r).at(0).value).toBe('2020');
  });

  it('does not touch the values of a saved chart when it is loaded', () => {
    const r = rule('in', ['a', 'b']);

    expect(valuesOf(r).value).toEqual(['a', 'b']);
  });
});
