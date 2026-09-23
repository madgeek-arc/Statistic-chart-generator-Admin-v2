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

// Every aggregate except 'total' aggregates a field, and the backend rejects
// the query (HTTP 422) when that field is missing, so the form must not let
// "Create Chart" through without it.
describe('FormFactoryService y-axis entity field', () => {
  let factory: FormFactoryService;

  const yaxis = (raw: { aggregate: string | null; field?: string | null }) =>
    factory.createDataseriesGroup(0, {
      data: {
        yaxisData: {
          entity: 'dataset',
          yaxisAggregate: raw.aggregate,
          yaxisEntityField: { name: raw.field ?? null, type: raw.field ? 'text' : null }
        },
        xaxisData: [{ name: 'dataset.publisher', type: 'text' }]
      }
    });
  const fieldName = (series: FormGroup) => series.get('data.yaxisData.yaxisEntityField.name');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    factory = TestBed.inject(FormFactoryService);
  });

  it('does not need a field for the total aggregate', () => {
    const series = yaxis({ aggregate: 'total' });

    expect(fieldName(series).valid).toBeTrue();
    expect(series.valid).toBeTrue();
  });

  it('needs a field as soon as the aggregate is anything but total', () => {
    const series = yaxis({ aggregate: 'total' });

    for (const aggregate of ['count', 'sum', 'min', 'max', 'avg']) {
      series.get('data.yaxisData.yaxisAggregate').setValue(aggregate);

      expect(fieldName(series).hasError('required')).withContext(aggregate).toBeTrue();
      expect(series.valid).withContext(aggregate).toBeFalse();
    }
  });

  it('becomes valid once a field is picked and invalid again when it is cleared', () => {
    const series = yaxis({ aggregate: 'avg' });
    const field = series.get('data.yaxisData.yaxisEntityField');

    field.setValue({ name: 'dataset.year', type: 'int' });
    expect(series.valid).toBeTrue();

    // select-attribute resets the field when the entity changes
    field.reset();
    expect(series.valid).toBeFalse();
  });

  it('stops requiring the field when the aggregate goes back to total', () => {
    const series = yaxis({ aggregate: 'sum' });
    expect(series.valid).toBeFalse();

    series.get('data.yaxisData.yaxisAggregate').setValue('total');

    expect(series.valid).toBeTrue();
  });

  it('flags a loaded chart that aggregates a field but has none', () => {
    expect(yaxis({ aggregate: 'sum', field: null }).valid).toBeFalse();
    expect(yaxis({ aggregate: 'sum', field: 'dataset.year' }).valid).toBeTrue();
  });

  it('keeps the field required after the dataseries is duplicated', () => {
    const original = yaxis({ aggregate: 'avg', field: 'dataset.year' });

    const copy = factory.createDataseriesGroup(1, factory.serializeControl(original));
    expect(copy.valid).toBeTrue();

    fieldName(copy).setValue(null);
    expect(copy.valid).toBeFalse();
  });
});

// The "numbers" diagram (id 14) has no x-axis, so every dataseries' x-axis
// data is disabled while it is selected.
describe('FormFactoryService x-axis and the numbers diagram', () => {
  let factory: FormFactoryService;
  let root: FormGroup;

  const diagramId = () => root.get('category.diagram.diagramId');
  const dataseries = () => root.get('dataseries') as FormArray;
  const xaxisDisabled = () => dataseries().controls.map(group => group.get('data.xaxisData').disabled);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    factory = TestBed.inject(FormFactoryService);
    root = factory.createForm();
  });

  it('disables the x-axis of every dataseries for the numbers diagram and re-enables it after', () => {
    dataseries().push(factory.createDataseriesGroup(1));

    diagramId().setValue(14);
    expect(xaxisDisabled()).toEqual([true, true]);

    diagramId().setValue(1);
    expect(xaxisDisabled()).toEqual([false, false]);
  });

  it('starts a dataseries added while the numbers diagram is selected with its x-axis disabled', () => {
    diagramId().setValue(14);

    dataseries().push(factory.createDataseriesGroup(1));

    expect(xaxisDisabled()).toEqual([true, true]);
  });

  // The dashboard's resetForm() swaps the category group (and with it the
  // diagramId control) and the dataseries array when the view changes.
  it('follows the diagram after the category and dataseries are replaced', () => {
    root.setControl('category', factory.createCategoryGroup());
    root.setControl('dataseries', factory.createDataseriesGroupArray());

    diagramId().setValue(14);

    expect(xaxisDisabled()).toEqual([true]);
  });

  it('stops touching a dataseries once it is removed', () => {
    dataseries().push(factory.createDataseriesGroup(1));
    const removed = dataseries().at(1).get('data.xaxisData');
    dataseries().removeAt(1);
    const disable = spyOn(removed, 'disable').and.callThrough();

    diagramId().setValue(14);

    expect(disable).not.toHaveBeenCalled();
    expect(xaxisDisabled()).toEqual([true]);
  });
});
