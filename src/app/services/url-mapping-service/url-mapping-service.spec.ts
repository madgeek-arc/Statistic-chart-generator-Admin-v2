import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import { UrlMappingService } from './url-mapping-service';
import { DynamicFormHandlingService } from '../dynamic-form-handling-service/dynamic-form-handling.service';
import { DynamicTreeDatabase } from '../dynamic-tree-database/dynamic-tree-database.service';
import { DiagramCategoryService } from '../diagram-category-service/diagram-category.service';
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
  ['result', { name: 'result', relations: ['organization'], fields: [] }],
  ['organization', { name: 'organization', relations: [], fields: [{ name: 'country', type: 'text' }] }]
]);

const availableDiagrams = [
  { type: 'column', isPolar: false, diagramId: 1, supportedLibraries: ['HighCharts'] },
  { type: 'world', isPolar: false, diagramId: 2, supportedLibraries: ['HighMaps'] }
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
