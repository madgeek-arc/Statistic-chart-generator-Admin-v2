import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UrlMappingService } from './url-mapping-service';
import { DynamicFormHandlingService } from '../dynamic-form-handling-service/dynamic-form-handling.service';
import { DynamicTreeDatabase } from '../dynamic-tree-database/dynamic-tree-database.service';
import { DiagramCategoryService } from '../diagram-category-service/diagram-category.service';
import { MappingProfilesService } from '../mapping-profiles-service/mapping-profiles.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { answerProfile, entityNode, profileNamed } from '../dynamic-tree-database/dynamic-tree-database.testing';
import { FormFactoryService } from '../form-factory-service/form-factory-service';
import { CachedEntityNode } from '../../dashboard/helper-components/select-attribute/dynamic-entity-tree/entity-tree-nodes.types';
import { HighChartsChart } from '../supported-libraries-service/models/chart-description-HighCharts.model';
import { HighMapsMap } from '../supported-libraries-service/models/chart-description-HighMaps.model';

// These specs replay real chart links pulled from services.openaire.eu on 22 Sep 2026
// through the same pipeline the app's header "Load" field drives: UrlMappingService
// reconstructs a form schema from the given chart JSON, then DiagramCreator (inside
// DynamicFormHandlingService) regenerates a chart object from that schema. Comparing
// the regenerated object back against the given JSON is the same "compare parsed
// config" method used to find bugs #3 and #4 in the 22 Sep audit-notes entry by hand;
// this pins it down as an automated, offline regression check.
//
// Scope: this goes straight from raw chart JSON to the regenerated chart object via
// UrlMappingService.reconstructFromUrlJson() + DynamicFormHandlingService.submitForm(),
// skipping the Angular reactive-form/DashboardComponent machinery that normally sits
// between them in the browser. That machinery only moves data in and out of a
// FormGroup — it isn't where either bug lives — so bypassing it keeps this fast and
// dependency-free without changing what's actually being verified.

const entityMap = new Map<string, CachedEntityNode>([
  ['indi_impact_measures', {
    name: 'indi_impact_measures',
    relations: ['publication', 'result'],
    fields: [{ name: 'score_dec', type: 'double' }, { name: 'impactmetric', type: 'text' }]
  }],
  ['publication', { name: 'publication', relations: [], fields: [{ name: 'year', type: 'int' }] }],
  ['result', { name: 'result', relations: ['organization'], fields: [{ name: 'year', type: 'int' }] }],
  ['organization', { name: 'organization', relations: [], fields: [{ name: 'country', type: 'text' }] }],
  ['result_result', {
    name: 'result_result',
    relations: ['result'],
    fields: [{ name: 'source_type', type: 'text' }, { name: 'target_type', type: 'text' }, { name: 'relclass', type: 'text' }]
  }]
]);

const availableDiagrams = [
  { type: 'column', isPolar: false, diagramId: 1, supportedLibraries: ['HighCharts'] },
  { type: 'world', isPolar: false, diagramId: 2, supportedLibraries: ['HighMaps'] },
  // Same entry the real /chart/special endpoint returns (see supported-chart-types.service.spec.ts).
  { type: 'combo', isPolar: false, diagramId: 13, supportedLibraries: ['HighCharts', 'GoogleCharts', 'eCharts'] }
];

const supportedMaps = [
  { type: 'world', name: 'custom/world-robinson-highres', supportedLibraries: ['HighMaps'] }
];

// DynamicFormHandlingService.createDataObjectsFromSchemaObject() reads
// appearance.chartAppearance.generalOptions.visualisationLibrary off the *live*
// reactive form (not off the SCGAFormSchema being submitted) to decide how to merge
// NL-chat options in — a path these specs never exercise, but the read happens
// unconditionally, so the control still has to exist.
function fakeFormRoot(): FormGroup {
  return new FormGroup({
    appearance: new FormGroup({
      chartAppearance: new FormGroup({
        generalOptions: new FormGroup({
          visualisationLibrary: new FormControl('HighCharts')
        })
      })
    })
  });
}

// Trimmed from the "Total Citations" / "by Access Rights over time" URL tested 22 Sep:
// 2 of its 5 series, same alpha-channel colors, and the same chart.type "line" with
// every series set to "column" that triggered the container-type flattening (item 17).
function highChartsFixture(): any {
  return {
    library: 'HighCharts',
    chartDescription: {
      queries: [
        {
          name: 'OA w/ Licence', type: 'column', color: '#0500a5c7',
          query: {
            parameters: [],
            select: [
              { field: 'indi_impact_measures.score_dec', aggregate: 'sum' },
              { field: 'indi_impact_measures.publication.year', aggregate: null }
            ],
            filters: [{
              groupFilters: [{ field: 'indi_impact_measures.publication.year', type: '>=', values: ['2007'] }],
              op: 'AND'
            }],
            entity: 'indi_impact_measures', profile: 'ie_monitor', limit: '30'
          }
        },
        {
          name: 'OA w/o Licence', type: 'column', color: '#81e6efff',
          query: {
            parameters: [],
            select: [
              { field: 'indi_impact_measures.score_dec', aggregate: 'sum' },
              { field: 'indi_impact_measures.publication.year', aggregate: null }
            ],
            filters: [{
              groupFilters: [{ field: 'indi_impact_measures.publication.year', type: '<=', values: ['2025'] }],
              op: 'AND'
            }],
            entity: 'indi_impact_measures', profile: 'ie_monitor', limit: '30'
          }
        }
      ],
      colors: ['#0500a5c7', '#81e6efff', '#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
      series: [{ stacking: 'normal' }, { stacking: 'normal' }],
      chart: {
        type: 'line', polar: false, backgroundColor: '#FFFFFFFF', borderColor: '#335cadff',
        borderRadius: 0, borderWidth: 0, plotBorderColor: '#ccccccff', plotBorderWidth: 0, zoomType: 'xy'
      },
      title: { style: { color: '#333333FF', fontSize: '18px' }, text: 'Total Citations', margin: 15, align: 'center' },
      subtitle: { style: { color: '#666666FF', fontSize: '12px' }, text: 'by Access Rights over time', align: 'center' },
      yAxis: { title: { style: { color: '#666666FF', fontSize: '11px' }, text: ' ' }, zoomEnabled: true, reversedStacks: false },
      xAxis: { title: { style: { color: '#666666FF', fontSize: '11px' }, text: ' ' }, zoomEnabled: true },
      lang: { noData: 'No Data available for the Query' },
      exporting: { enabled: true },
      plotOptions: { series: { dataLabels: { enabled: false, style: { textOutline: '2px contrast', 'stroke-width': 0 } }, stacking: 'percent' } },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom', enabled: true },
      credits: { enabled: false, href: null },
      tooltip: { style: {}, pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})' }
    }
  };
}

// Trimmed from the HighMaps "Total Citations" / "by country" world-map URL tested
// 22 Sep, which lost its title, subtitle and legend setting on reload (item 4).
function highMapsFixture(): any {
  return {
    library: 'HighMaps',
    mapDescription: {
      chart: { map: 'custom/world-robinson-highres' },
      colorAxis: { min: null, max: null, type: 'linear', minColor: '#E6EBF5', maxColor: '#003399' },
      credits: { enabled: false, href: null },
      exporting: { enabled: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom', enabled: false },
      mapNavigation: { enabled: false },
      queries: [{
        name: 'Data', type: 'world',
        query: {
          parameters: [],
          select: [
            { field: 'indi_impact_measures.score_dec', aggregate: 'sum' },
            { field: 'indi_impact_measures.result.organization.country', aggregate: null }
          ],
          filters: [{
            groupFilters: [{ field: 'indi_impact_measures.impactmetric', type: '=', values: ['influence_alt'] }],
            op: 'AND'
          }],
          entity: 'indi_impact_measures', profile: 'openaire_stats', limit: '200'
        }
      }],
      series: [{
        data: [], keys: ['iso-a2', 'value'], joinBy: 'iso-a2',
        dataLabels: { enabled: false, format: '{point.name}', style: { textOutline: '2px contrast', 'stroke-width': 0 } },
        name: 'Data'
      }],
      subtitle: { style: { color: '#666666FF', fontSize: '12px' }, text: 'by country', align: 'center' },
      title: { style: { color: '#333333FF', fontSize: '18px' }, text: 'Total Citations', align: 'center', margin: 15 },
      zoomTo: { zoomValue: 1 }
    }
  };
}

// The parts of a saved chart's JSON the combo specs read; everything else passes through as given.
interface SavedChartJson {
  chartDescription: {
    queries: {
      name: string;
      type: string;
      color: string;
      query: {
        filters: { op: string; groupFilters: { field: string; type: string; values: string[] }[] }[];
        [key: string]: unknown;
      };
    }[];
    chart: { type: string; [key: string]: unknown };
    title: { text: string; [key: string]: unknown };
    subtitle: { text: string; [key: string]: unknown };
    legend: { enabled: boolean; [key: string]: unknown };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Decoded verbatim from a gr_monitor "Publications linked to Research Data" combo chart
// link (stats.madgik.di.uoa.gr, 23 Sep): chart.type "combo", a column series and a line
// series, each with an AND group of 4 filter rules (including >= / <= on the year) and an
// OR group of 13 relclass rules.
function highChartsComboFixture(): SavedChartJson {
  return {
    nlOptions: null,
    optionsSig: null,
    library: 'HighCharts',
    orderBy: null,
    chartDescription: {
      queries: [
        {
          name: 'Publications linked to Research Data',
          type: 'column',
          color: '#5aadcf',
          query: {
            parameters: [],
            select: [
              { field: 'result_result', aggregate: 'count' },
              { field: 'result_result.result.year', aggregate: null }
            ],
            filters: [
              {
                groupFilters: [
                  { field: 'result_result.source_type', type: '=', values: ['publication'] },
                  { field: 'result_result.target_type', type: '=', values: ['dataset'] },
                  { field: 'result_result.result.year', type: '>=', values: ['2007'] },
                  { field: 'result_result.result.year', type: '<=', values: ['2025'] }
                ],
                op: 'AND'
              },
              {
                groupFilters: [
                  { field: 'result_result.relclass', type: '=', values: ['IsSupplementTo'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsSupplementedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDescribedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Describes'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDocumentedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Documents'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsCompiledBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsReviewedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Reviews'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDerivedFrom'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsSourceOf'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsRequiredBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Requires'] }
                ],
                op: 'OR'
              }
            ],
            entity: 'result_result',
            profile: 'gr_monitor',
            limit: '30'
          }
        },
        {
          name: 'Publications linked to Software',
          type: 'line',
          color: '#88db00',
          query: {
            parameters: [],
            select: [
              { field: 'result_result', aggregate: 'count' },
              { field: 'result_result.result.year', aggregate: null }
            ],
            filters: [
              {
                groupFilters: [
                  { field: 'result_result.source_type', type: '=', values: ['publication'] },
                  { field: 'result_result.target_type', type: '=', values: ['software'] },
                  { field: 'result_result.result.year', type: '>=', values: ['2007'] },
                  { field: 'result_result.result.year', type: '<=', values: ['2025'] }
                ],
                op: 'AND'
              },
              {
                groupFilters: [
                  { field: 'result_result.relclass', type: '=', values: ['IsSupplementTo'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsSupplementedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDescribedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Describes'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDocumentedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Documents'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsCompiledBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsReviewedBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Reviews'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsDerivedFrom'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsSourceOf'] },
                  { field: 'result_result.relclass', type: '=', values: ['IsRequiredBy'] },
                  { field: 'result_result.relclass', type: '=', values: ['Requires'] }
                ],
                op: 'OR'
              }
            ],
            entity: 'result_result',
            profile: 'gr_monitor',
            limit: '30'
          }
        }
      ],
      colors: [
        '#5aadcf',
        '#88db00',
        '#2f7ed8',
        '#0d233a',
        '#8bbc21',
        '#910000',
        '#1aadce',
        '#492970',
        '#f28f43',
        '#77a1e5',
        '#c42525',
        '#a6c96a'
      ],
      series: [{}, {}],
      chart: {
        type: 'combo',
        polar: false,
        backgroundColor: null,
        borderColor: '#335cad',
        borderRadius: 0,
        borderWidth: 0,
        plotBorderColor: '#cccccc',
        plotBorderWidth: 0,
        zooming: { type: 'xy' },
        plotBackgroundColor: '#ffffff',
        plotBackgroundImage: null
      },
      title: {
        style: { color: '#333333', fontSize: '18px' },
        text: 'Publications linked to Research Data',
        margin: 15,
        align: 'center'
      },
      subtitle: { style: { color: '#666666', fontSize: '12px' }, text: 'over time', align: 'center' },
      yAxis: { title: { style: { color: '#666666', fontSize: '11px' }, text: null }, zoomEnabled: false },
      xAxis: { title: { style: { color: '#666666', fontSize: '11px' }, text: null }, zoomEnabled: false },
      lang: { noData: 'No Data available for the Query' },
      exporting: { enabled: true },
      plotOptions: {
        series: { dataLabels: { enabled: false, style: { textOutline: '2px contrast', 'stroke-width': 0 } } }
      },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom', enabled: true },
      credits: { enabled: false, text: 'Created by OpenAIRE via HighCharts', href: null },
      tooltip: { style: {} }
    }
  };
}

// The query of every series, as plain JSON: the regenerated chart holds Query/Filter class
// instances, which Jasmine's toEqual would not match against plain objects.
const queriesOf = (chart: HighChartsChart) => JSON.parse(JSON.stringify(chart.chartDescription.queries));

describe('URL round-trip: given chart JSON -> reconstructed form -> regenerated chart object', () => {
  let urlMappingService: UrlMappingService;
  let formHandlingService: DynamicFormHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DynamicTreeDatabase, useValue: { entityMap, entityMap$: of(entityMap) } },
        {
          provide: DiagramCategoryService, useValue: {
            availableDiagrams,
            supportedMaps,
            selectedDiagramCategory: { type: 'column' },
            changeDiagramCategory: () => { /* no-op: nothing here reads the service's own selection state */ }
          }
        },
        { provide: FormFactoryService, useValue: { getFormRoot: fakeFormRoot } }
      ]
    });

    urlMappingService = TestBed.inject(UrlMappingService);
    formHandlingService = TestBed.inject(DynamicFormHandlingService);
  });

  function regenerate(givenJson: any): HighChartsChart | HighMapsMap {
    const schema = urlMappingService.reconstructFromUrlJson(givenJson);
    formHandlingService.formSchemaObject = schema;
    formHandlingService.submitForm();
    return formHandlingService.ChartObject as HighChartsChart | HighMapsMap;
  }

  describe('HighCharts', () => {
    it('regenerates a chart at all', () => {
      const actual = regenerate(highChartsFixture()) as HighChartsChart;
      expect(actual).toBeTruthy();
      expect(actual.chartDescription.queries.length).toBe(2);
    });

    it('preserves the title and subtitle text', () => {
      const given = highChartsFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.title.text).toBe(given.chartDescription.title.text);
      expect(actual.chartDescription.subtitle.text).toBe(given.chartDescription.subtitle.text);
    });

    it('does not grow chartDescription.colors on repeated round trips', () => {
      const first = regenerate(highChartsFixture()) as HighChartsChart;
      // Feed the regenerated chart back in as the "given" JSON for a second round
      // trip, the same way reopening and resaving an already-styled chart would.
      const second = regenerate(first) as HighChartsChart;

      expect(second.chartDescription.colors.length).toBe(first.chartDescription.colors.length);
    });

    it('keeps a series color\'s alpha channel exactly', () => {
      const given = highChartsFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.colors[0]).toBe(given.chartDescription.queries[0].color);
    });
  });

  describe('HighCharts combo', () => {
    it('reconstructs the combo chart type, not the type of either series', () => {
      const schema = urlMappingService.reconstructFromUrlJson(highChartsComboFixture());

      expect(schema.category.diagram.type).toBe('combo');
      expect(schema.dataseries.map(d => d.chartProperties.chartType)).toEqual(['column', 'line']);
    });

    it('regenerates both series with their own type, name and color', () => {
      const given = highChartsComboFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.queries.map(q => [q.type, q.name, 'color' in q ? q.color : null]))
        .toEqual(given.chartDescription.queries.map(q => [q.type, q.name, q.color]));
    });

    it('regenerates every query exactly: select, filter groups, operators, values, entity, profile, limit', () => {
      const given = highChartsComboFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(queriesOf(actual).map((q: { query: unknown }) => q.query)).toEqual(given.chartDescription.queries.map(q => q.query));
    });

    // Unlike the "line" container in the fixture above (audit item: combo container flattened),
    // a chart saved as "combo" keeps that container type on reload.
    it('keeps the container chart type as combo', () => {
      const given = highChartsComboFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.chart.type).toBe(given.chartDescription.chart.type);
    });

    it('keeps the series colors first in the color list', () => {
      const given = highChartsComboFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.colors.slice(0, 2)).toEqual(['#5aadcf', '#88db00']);
    });

    it('preserves the title, subtitle and legend setting', () => {
      const given = highChartsComboFixture();
      const actual = regenerate(given) as HighChartsChart;

      expect(actual.chartDescription.title.text).toBe(given.chartDescription.title.text);
      expect(actual.chartDescription.subtitle.text).toBe(given.chartDescription.subtitle.text);
      expect(actual.chartDescription.legend.enabled).toBe(given.chartDescription.legend.enabled);
    });
  });

  describe('HighMaps', () => {
    it('regenerates a map at all', () => {
      const actual = regenerate(highMapsFixture()) as HighMapsMap;
      expect(actual).toBeTruthy();
      expect(actual.mapDescription.queries.length).toBe(1);
    });

    it('preserves the title, subtitle text and legend setting', () => {
      const given = highMapsFixture();
      const actual = regenerate(given) as HighMapsMap;

      expect(actual.mapDescription.title.text).toBe(given.mapDescription.title.text);
      expect(actual.mapDescription.subtitle.text).toBe(given.mapDescription.subtitle.text);
      expect(actual.mapDescription.legend.enabled).toBe(given.mapDescription.legend.enabled);
    });

    it('keeps the color axis min/max colors exactly, with no alpha added', () => {
      const given = highMapsFixture();
      const actual = regenerate(given) as HighMapsMap;

      expect(actual.mapDescription.colorAxis.minColor).toBe(given.mapDescription.colorAxis.minColor);
      expect(actual.mapDescription.colorAxis.maxColor).toBe(given.mapDescription.colorAxis.maxColor);
    });
  });
});

// The specs above skip the reactive form. This one loads a chart into the real dashboard form
// the way DashboardComponent.updateFormFile() does (adjustAndPatchFormWithValidators, then a
// silent patchValue), checks what the form holds, and regenerates the chart from the form's own
// value, as Create Chart would.
describe('URL load into the dashboard form: combo chart', () => {
  let root: FormGroup;
  let given: ReturnType<typeof highChartsComboFixture>;
  let formHandlingService: DynamicFormHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DynamicTreeDatabase, useValue: { entityMap, entityMap$: of(entityMap) } },
        {
          provide: DiagramCategoryService, useValue: {
            availableDiagrams,
            supportedMaps,
            selectedDiagramCategory: { type: 'combo' },
            changeDiagramCategory: () => { /* no-op */ }
          }
        }
      ]
    });

    formHandlingService = TestBed.inject(DynamicFormHandlingService);
    root = TestBed.inject(FormFactoryService).createForm();
    given = highChartsComboFixture();

    const schema = TestBed.inject(UrlMappingService).reconstructFromUrlJson(highChartsComboFixture());
    formHandlingService.adjustAndPatchFormWithValidators(root, schema);
    root.patchValue(schema, { emitEvent: false });
  });

  const series = (i: number) => (root.get('dataseries') as FormArray).at(i);
  const groups = (i: number) => series(i).get('data.filters') as FormArray;
  const rules = (i: number, g: number) => groups(i).at(g).get('groupFilters') as FormArray;

  it('holds the combo diagram and both series with their own chart type', () => {
    expect(root.get('category.diagram.type')?.value).toBe('combo');
    expect((root.get('dataseries') as FormArray).length).toBe(2);
    expect(series(0).get('chartProperties.chartType')?.value).toBe('column');
    expect(series(1).get('chartProperties.chartType')?.value).toBe('line');
  });

  it('holds every filter group with its operator and every rule with its field, operator and values', () => {
    given.chartDescription.queries.forEach((q, i) => {
      expect(groups(i).length).toBe(q.query.filters.length);

      q.query.filters.forEach((group, g) => {
        expect(groups(i).at(g).get('op')?.value).toBe(group.op);
        expect(rules(i, g).length).toBe(group.groupFilters.length);

        group.groupFilters.forEach((rule, r) => {
          const control = rules(i, g).at(r);
          expect(control.get('field.name')?.value).toBe(rule.field);
          expect(control.get('type')?.value).toBe(rule.type);
          expect(control.get('values')?.value).toEqual(rule.values);
        });
      });
    });
  });

  it('types the filter fields from the entity schema', () => {
    const fieldTypes = rules(0, 0).controls.map(c => c.get('field.type')?.value);

    expect(fieldTypes).toEqual(['text', 'text', 'int', 'int']);
  });

  // A disabled control is left out of the form's value, so an operator that stayed disabled
  // would silently drop from the query that Create Chart sends.
  it('keeps every filter operator enabled', () => {
    const disabled = [0, 1].flatMap(i => [0, 1].flatMap(g => rules(i, g).controls))
      .filter(c => c.get('type')?.disabled);

    expect(disabled.length).toBe(0);
  });

  it('regenerates the given queries from the form value, as Create Chart would', () => {
    formHandlingService.formSchemaObject = root.value;
    formHandlingService.submitForm();
    const actual = formHandlingService.ChartObject as HighChartsChart;

    expect(queriesOf(actual).map((q: { type: string, name: string, query: unknown }) => [q.type, q.name, q.query]))
      .toEqual(given.chartDescription.queries.map(q => [q.type, q.name, q.query]));
  });
});

// The header's Load field, with the dashboard already on another profile. Field types are looked
// up in the entity map, so the link's own profile has to be loaded before the form is rebuilt.
describe('Loading a chart link of another profile into a dashboard in use', () => {
  // The parts of the rebuilt form these specs read.
  interface LoadedForm {
    dataseries: { data: {
      xaxisData: { xaxisEntityField: unknown }[];
      filters: { groupFilters: { field: unknown }[] }[];
    } }[];
  }

  let urlMappingService: UrlMappingService;
  let formHandlingService: DynamicFormHandlingService;
  let http: HttpTestingController;
  let serviceUrl: string;
  let loadedForms: LoadedForm[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: DiagramCategoryService, useValue: {
            availableDiagrams,
            supportedMaps,
            selectedDiagramCategory: { type: 'column' },
            changeDiagramCategory: () => { /* no-op: nothing here reads the service's own selection state */ }
          }
        },
        { provide: FormFactoryService, useValue: { getFormRoot: fakeFormRoot } }
      ]
    });
    urlMappingService = TestBed.inject(UrlMappingService);
    formHandlingService = TestBed.inject(DynamicFormHandlingService);
    http = TestBed.inject(HttpTestingController);
    serviceUrl = TestBed.inject(UrlProviderService).serviceURL;

    http.expectOne(serviceUrl + '/schema/profiles').flush([profileNamed('openaire'), profileNamed('gr_monitor')]);
    TestBed.inject(MappingProfilesService).changeSelectedProfile('openaire');
    answerProfile(http, serviceUrl, 'openaire', [entityNode('result', { title: 'text' })]);

    loadedForms = [];
    formHandlingService.jsonLoaded.pipe(filter(loaded => loaded))
      .subscribe(() => loadedForms.push(formHandlingService.loadFormObject as LoadedForm));
  });

  const answerGrMonitor = () => answerProfile(http, serviceUrl, 'gr_monitor', [
    entityNode('result_result', { source_type: 'text', target_type: 'text', relclass: 'text' }, ['result']),
    entityNode('result', { year: 'int' })
  ]);

  it('waits for the link\'s profile before rebuilding the form', () => {
    urlMappingService.updateFormObjet(highChartsComboFixture());
    expect(loadedForms).toEqual([]);

    answerGrMonitor();

    expect(loadedForms.length).toBe(1);
  });

  it('types the loaded fields from the link\'s profile', () => {
    urlMappingService.updateFormObjet(highChartsComboFixture());
    answerGrMonitor();

    const dataseries = loadedForms[0].dataseries[0].data;
    expect(dataseries.xaxisData[0].xaxisEntityField).toEqual({ name: 'result_result.result.year', type: 'int' });
    expect(dataseries.filters[0].groupFilters[2].field).toEqual({ name: 'result_result.result.year', type: 'int' });
  });
});
