import { Query } from './chart-query.model';

describe('Query filters', () => {
  const build = (groupFilters: { field: string; type: string; values: (string | null)[] }[]) => {
    const data: any = {
      yaxisData: { entity: 'dataset', yaxisAggregate: 'total', yaxisEntityField: { name: null, type: null } },
      xaxisData: [],
      filters: [{
        op: 'AND',
        groupFilters: groupFilters.map(g => ({ field: { name: g.field }, type: g.type, values: g.values }))
      }]
    };
    return new Query(data, 'openaire', '10');
  };

  it('sends no values for is_null / is_not_null', () => {
    const q = build([
      { field: 'dataset.publisher', type: 'is_null', values: ['ignored'] },
      { field: 'dataset.year', type: 'is_not_null', values: [null] }
    ]);

    expect(q.filters[0].groupFilters[0].values).toEqual([]);
    expect(q.filters[0].groupFilters[1].values).toEqual([]);
  });

  it('drops empty and null values but keeps the real ones', () => {
    const q = build([{ field: 'dataset.publisher', type: 'in', values: ['a', '', null, 'b'] }]);

    expect(q.filters[0].groupFilters[0].values).toEqual(['a', 'b']);
  });

  it('keeps a single value for a normal operator', () => {
    const q = build([{ field: 'dataset.publisher', type: '=', values: ['Zenodo'] }]);

    expect(q.filters[0].groupFilters[0].values).toEqual(['Zenodo']);
  });
});
