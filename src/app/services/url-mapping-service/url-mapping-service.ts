import { inject, Injectable } from "@angular/core";
import { DynamicFormHandlingService } from "../dynamic-form-handling-service/dynamic-form-handling.service";
import { DiagramCategoryService } from "../diagram-category-service/diagram-category.service";
import { ISupportedCategory } from "../supported-chart-types-service/supported-chart-types.service";
import { ChartInfo, Query } from "../supported-libraries-service/models/chart-query.model";
import { DynamicTreeDatabase } from "../dynamic-tree-database/dynamic-tree-database.service";
import { filter, first } from "rxjs/operators";
import { MappingProfilesService } from "../mapping-profiles-service/mapping-profiles.service";
import {
  AppearanceFormSchema,
  ChartAppearanceFormSchema,
  HighmapsOptionsFormSchema,
  SCGAFormSchema,
  TableAppearanceFormSchema
} from "../supported-libraries-service/chart-form-schema.classes";

@Injectable({ providedIn: 'root' })
export class UrlMappingService {
  private formHandlingService = inject(DynamicFormHandlingService);
  private dynamicTreeDatabase = inject(DynamicTreeDatabase);
  private profileService = inject(MappingProfilesService);

  private diagramService = inject(DiagramCategoryService);

  updateFormObjet(urlJson: any, rawData = false) {
    let profile = urlJson.library === 'HighMaps'
      ? urlJson.mapDescription?.queries?.[0]?.query?.profile
      : urlJson.chartDescription?.queries?.[0]?.query?.profile;

    if (rawData) {
      profile = urlJson.series?.[0]?.query.profile;
    }

    if (profile) {
      this.profileService.changeSelectedProfile(profile);
    }

    this.dynamicTreeDatabase.entityMap$.pipe(
      filter(map => map !== null && map.size > 0),
      first()
    ).subscribe(() => {
      this.formHandlingService.loadFormObject = this.reconstructFromUrlJson(urlJson, rawData);
    });
  }

  private getFieldType(entityName: string, fieldPath: string): string {
    // Default to 'text' if we can't determine the type
    let fieldType = 'text';

    const entityMap = this.dynamicTreeDatabase.entityMap;
    if (!entityMap) {
      console.warn('EntityMap not available yet');
      return fieldType;
    }

    // Split the field path to handle nested fields (e.g., "relation.field")
    const pathParts = fieldPath.split('.');
    let currentEntity = entityName;

    for (let i = 1; i < pathParts.length; i++) {
      const partName = pathParts[i];
      const cachedEntity = entityMap.get(currentEntity);

      if (!cachedEntity) {
        console.warn(`Entity not found in map: ${currentEntity}`);
        break;
      }

      // Check if this is the last part (actual field) or a relation
      if (i === pathParts.length - 1) {
        // This is the field - find its type
        const field = cachedEntity.fields.find(f => f.name === partName);
        if (field) {
          fieldType = field.type;
        } else {
          console.warn(`Field not found: ${partName} in entity ${currentEntity}`);
        }
      } else {
        // This is a relation - navigating to the next entity
        if (cachedEntity.relations.includes(partName)) {
          currentEntity = partName;
        } else {
          console.warn(`Relation not found: ${partName} in entity ${currentEntity}`);
          break;
        }
      }
    }

    return fieldType;
  }

  reconstructFromUrlJson(urlJson: any, rawData?: boolean): SCGAFormSchema {

    // Defensive guard
    if (!urlJson || typeof urlJson !== 'object') {
      throw new Error('Invalid urlJson provided');
    }

    if (rawData) { // If rawData is true, we consider the chart to be a number chart
      const chartType = 'numbers';

      // 1) Build `view`
      const view = {
        profile: urlJson.series?.[0]?.query.profile
      };


      // 2) Build `category.diagram` matching polar and type in availableDiagrams
      const category = {
        // type should eventually be inferred from chartDescription.chart.type!'
        diagram: this.diagramService.availableDiagrams.find(d => d.type === chartType)
      }
      this.diagramService.changeDiagramCategory(category.diagram);

      // 3) Build `dataseries`

      interface NumberSeries {
        query: Query;
      }
      const dataseries = urlJson.series.map((s: NumberSeries, index: number) => {

        // 3a) yaxisData
        const yaxisField = {...s.query.select[0]}; // Select[0] is always the y-axis data
        if (yaxisField.field === s.query.entity && yaxisField.aggregate === 'count') { // Handle total count specially
          yaxisField.aggregate = 'total';
        }

        const yaxisData = {
          entity: yaxisField.field.split('.')[0], // Entity is always(?) the first part of the field name
          yaxisAggregate: yaxisField.aggregate,
          yaxisEntityField: yaxisField.aggregate === 'total' ? { name: null, type: null } : {
            name: yaxisField.field,
            type: this.getFieldType(s.query.entity, yaxisField.field) // Look up type dynamically
          },
        };

        // 3b) xaxisData (everything beyond index 0 in `select`)
        const xaxisData = s.query.select.slice(1).map((select) => ({
          xaxisEntityField: {
            name: select.field,
            type: this.getFieldType(s.query.entity, select.field) // Look up type dynamically
          },
        }));

        // 3c) filters (copy groupFilters verbatim, inferring type)
        const filters = s.query.filters.map((group) => ({
          groupFilters: group.groupFilters.map((f) => ({
            field: {
              name: f.field,
              type: this.getFieldType(s.query.entity, f.field), // Look up type dynamically
            },
            type: f.type,
            values: f.values,
          })),
          op: group.op,
        }));

        // 3d) chartProperties
        const chartProperties = {
          chartType: null as any,
          dataseriesColor: null as any,
          dataseriesName: 'Data (' + index + ')',
          stacking: 'null',
        };

        return {
          data: { yaxisData, xaxisData, filters },
          chartProperties,
        };
      });

      const appearance: AppearanceFormSchema = new class implements AppearanceFormSchema {
        chartAppearance: ChartAppearanceFormSchema;
        tableAppearance: TableAppearanceFormSchema;
      }

      return {
        view,
        category,
        dataseries,
        appearance
      };

    }

    // determine library
    const library = urlJson.library;

    // If it's HighMaps, the payload may be under mapDescription (root) or under chartDescription
    if (library === 'HighMaps') {
      const mapDesc = urlJson.mapDescription;

      // view.profile - try to find the profile inside the first query
      const profile = mapDesc.queries?.[0]?.query?.profile;

      // pick a diagram: try to match query.type or fallback to a map-like diagram
      const firstQueryType = mapDesc.queries?.[0]?.type ?? 'world';
      const diagram: ISupportedCategory | undefined =
        this.diagramService.availableDiagrams.find(d => d.type === firstQueryType) ||
        this.diagramService.availableDiagrams.find(d => d.type?.toLowerCase().includes('map')) ||
        this.diagramService.availableDiagrams[0];

      // build dataseries similar to charts but adapted for maps
      const dataseries = (mapDesc.queries ?? []).map((q: ChartInfo, index: number) => {
        const yaxisField = {...q.query.select[0]}; // Select[0] is always the y-axis data
        if (yaxisField.field === q.query.entity && yaxisField.aggregate === 'count') { // Handle total count specially
          yaxisField.aggregate = 'total';
        }

        const yaxisData = {
          entity: yaxisField.field.split('.')[0], // Entity is always(?) the first part of the field name
          yaxisAggregate: yaxisField.aggregate,
          yaxisEntityField: yaxisField.aggregate === 'total' ? { name: null, type: null } : {
            name: yaxisField.field,
            type: this.getFieldType(q.query.entity, yaxisField.field) // Look up type dynamically
          },
        };

        const xaxisData = (q.query?.select ?? []).slice(1).map((sel: any) => ({
          xaxisEntityField: {
            name: sel.field,
            type: this.getFieldType(q.query.entity, sel.field)
          }
        }));

        const filters = (q.query?.filters ?? []).map((group: any) => ({
          groupFilters: (group.groupFilters ?? []).map((f: any) => ({
            field: {
              name: f.field,
              type: typeof f.values?.[0] === 'string' && /^\d+$/.test(f.values?.[0]) ? 'int' : 'text'
            },
            type: f.type,
            values: f.values ?? []
          })),
          op: group.op
        }));

        const chartProperties = {
          chartType: q.type,
          dataseriesColor: q.color ?? '',
          dataseriesName: q.name ?? `series ${index + 1}`,
          stacking: (mapDesc.series?.[index]?.stacking) ?? 'null'
        };

        return {
          data: { yaxisData, xaxisData, filters },
          chartProperties
        };
      });

      // appearance.generalOptions
      const generalOptions = {
        visualisationLibrary: library,
        resultsLimit: parseInt(mapDesc.queries?.[0]?.query?.limit ?? '0', 10),
        orderByAxis: urlJson.orderBy ?? 'xaxis'
      };

      // DiagramCreator.createDynamicHighMapsMap() reads its appearance options from
      // highmapsAppearanceOptions (hm*-prefixed fields), not highchartsAppearanceOptions
      // (hc*-prefixed) — the two are separate, both-optional properties of
      // ChartAppearanceFormSchema, so building the wrong one here type-checked fine but
      // left every map's title, subtitle and legend setting silently unset on reload.
      const hmaOptions: HighmapsOptionsFormSchema = {
        title: {
          titleText: mapDesc.title?.text ?? '',
          color: mapDesc.title?.style?.color ?? '#333333FF',
          fontSize: parseFloat((mapDesc.title?.style?.fontSize ?? '18').toString()),
          align: mapDesc.title?.align ?? 'center',
          margin: mapDesc.title?.margin ?? 15
        },
        subtitle: {
          subtitleText: mapDesc.subtitle?.text ?? '',
          color: mapDesc.subtitle?.style?.color ?? '#666666FF',
          fontSize: parseFloat((mapDesc.subtitle?.style?.fontSize ?? '12').toString()),
          align: mapDesc.subtitle?.align ?? 'center'
        },
        hmCredits: {
          hmEnableCredits: mapDesc.credits?.enabled ?? false,
          hmCreditsText: mapDesc.credits?.text
        },
        hmLegend: {
          hmEnableLegend: mapDesc.legend?.enabled ?? true
        },
        hmMiscOptions: {
          exporting: mapDesc.exporting?.enabled ?? true,
          hmEnableDataLabels: mapDesc.series?.[0]?.dataLabels?.enabled ?? false,
          hmEnableMapNavigation: mapDesc.mapNavigation?.enabled ?? false
        },
        hmColorAxis: {
          hmColorAxisMin: mapDesc.colorAxis?.min ?? undefined,
          hmColorAxisMax: mapDesc.colorAxis?.max ?? undefined,
          hmColorAxisType: mapDesc.colorAxis?.type,
          hmColorAxisMinColor: mapDesc.colorAxis?.minColor,
          hmColorAxisMaxColor: mapDesc.colorAxis?.maxColor
        },
        hmZoomTo: mapDesc.zoomTo
      };

      const tableAppearance = { paginationSize: 30 };

      return {
        view: { profile },
        category: {
          diagram
        },
        dataseries,
        appearance: {
          chartAppearance: {
            generalOptions,
            highmapsAppearanceOptions: hmaOptions
          },
          tableAppearance
        }
      };
    }

    // -------------------------------
    // Default handler: HighCharts
    // -------------------------------

    // 1) Build `view`
    const view = {
      profile: urlJson.chartDescription.queries[0]?.query.profile,
    };

    // Check if the chart type is line, if so, there is a possibility that the chart type is not set correctly
    let chartType = urlJson.chartDescription.chart.type;
    if (urlJson.chartDescription.chart.type === 'line') {
      urlJson.chartDescription.queries.forEach((q: ChartInfo, index: number) => {
        if (q.type !== chartType) { // Not a line series found
          chartType = q.type; // Set the chart type to the first non-line series
          if (index > 0) // If there is more than one type mismatch, set the chart type to combo
            chartType = 'combo';
        }
      });
    }
    // 2) Build `category.diagram` matching polar and type in availableDiagrams
    const category = {
      // type should eventually be inferred from chartDescription.chart.type!'
      diagram: this.diagramService.availableDiagrams.find(d =>
        d.isPolar === urlJson.chartDescription.chart.polar && d.type === chartType
      )
    }
    this.diagramService.changeDiagramCategory(category.diagram);

    // 3) Build `dataseries`
    const validStacking = ['normal', 'percent', 'stream', 'overlap'];
    const dataseries = urlJson.chartDescription.queries.map((q: ChartInfo, index: number) => {

      // 3a) yaxisData
      const yaxisField = {...q.query.select[0]}; // Select[0] is always the y-axis data
      if (yaxisField.field === q.query.entity && yaxisField.aggregate === 'count') { // Handle total count specially
        yaxisField.aggregate = 'total';
      }

      const yaxisData = {
        entity: yaxisField.field.split('.')[0], // Entity is always(?) the first part of the field name
        yaxisAggregate: yaxisField.aggregate,
        yaxisEntityField: yaxisField.aggregate === 'total' ? { name: null, type: null } : {
          name: yaxisField.field,
          type: this.getFieldType(q.query.entity, yaxisField.field) // Look up type dynamically
        },
      };

      // 3b) xaxisData (everything beyond index 0 in `select`)
      const xaxisData = q.query.select.slice(1).map((select) => ({
        xaxisEntityField: {
          name: select.field,
          type: this.getFieldType(q.query.entity, select.field) // Look up type dynamically
        },
      }));

      // 3c) filters (copy groupFilters verbatim, inferring type)
      const filters = q.query.filters.map((group) => ({
        groupFilters: group.groupFilters.map((f) => ({
          field: {
            name: f.field,
            type: this.getFieldType(q.query.entity, f.field), // Look up type dynamically
          },
          type: f.type,
          values: f.values,
        })),
        op: group.op,
      }));

      // 3d) chartProperties
      const chartProperties = {
        chartType: q.type,
        dataseriesColor: q.color,
        dataseriesName: q.name,
        stacking: validStacking.includes(urlJson.chartDescription.series[index]?.stacking) ? urlJson.chartDescription.series[index].stacking : 'null',
      };

      return {
        data: { yaxisData, xaxisData, filters },
        chartProperties,
      };
    });

    // 4) Build `appearance.chartAppearance.generalOptions`
    const generalOptions = {
      visualisationLibrary: urlJson.library,
      resultsLimit: parseInt(urlJson.chartDescription.queries[0]?.query.limit || "30", 10),
      orderByAxis: urlJson.orderBy,
    };

    // 5) Build `appearance.chartAppearance.highchartsAppearanceOptions`
    const hcaOpts = urlJson.chartDescription;
    const hcaOptions = {
      title: {
        titleText: hcaOpts.title.text,
        color: hcaOpts.title.style.color,
        fontSize: parseFloat(hcaOpts.title.style.fontSize),
        align: hcaOpts.title.align,
        margin: hcaOpts.title.margin,
      },
      subtitle: {
        subtitleText: hcaOpts.subtitle.text,
        color: hcaOpts.subtitle.style.color,
        fontSize: parseFloat(hcaOpts.subtitle.style.fontSize),
        align: hcaOpts.subtitle.align,
      },
      xAxis: {
        xAxisText: hcaOpts.xAxis.title.text,
        color: hcaOpts.xAxis.title.style.color,
        fontSize: parseFloat(hcaOpts.xAxis.title.style.fontSize),
      },
      yAxis: {
        yAxisText: hcaOpts.yAxis.title.text,
        color: hcaOpts.yAxis.title.style.color,
        fontSize: parseFloat(hcaOpts.yAxis.title.style.fontSize),
        reversedStacks: hcaOpts.yAxis.reversedStacks,
      },
      // dataSeriesColorArray is the Appearance panel's user-curated "extra colors"
      // swatch list, which starts empty for a new chart (form-factory-service.ts) —
      // each series' own color already round-trips separately via chartProperties
      // .dataseriesColor above. Seeding this from the chart's own already-flattened
      // colors array (dataseriesColors + defaults, merged by createDynamicHighChartsChart)
      // fed it back into that same concat on every reload, growing it without bound.
      dataSeriesColorArray: [] as string[],
      hcChartArea: {
        hcCABackGroundColor: hcaOpts.chart.backgroundColor,
        hcCABorderWidth: hcaOpts.chart.borderWidth,
        hcCABorderCornerRadius: hcaOpts.chart.borderRadius,
        hcCABorderColor: hcaOpts.chart.borderColor,
      },
      hcPlotArea: {
        hcPABorderWidth: hcaOpts.chart.plotBorderWidth,
        hcPABorderColor: hcaOpts.chart.plotBorderColor,
      },
      hcCredits: {
        hcEnableCredits: hcaOpts.credits.enabled,
        hcCreditsText: hcaOpts.credits.text,
      },
      hcLegend: {
        hcEnableLegend: hcaOpts.legend.enabled,
        hcLegendLayout: hcaOpts.legend.layout,
        hcLegendHorizontalAlignment: hcaOpts.legend.align,
        hcLegendVerticalAlignment: hcaOpts.legend.verticalAlign,
      },
      hcMiscOptions: {
        exporting: hcaOpts.exporting.enabled,
        stackedChart: validStacking.includes(hcaOpts.plotOptions.series.stacking) ? hcaOpts.plotOptions.series.stacking : 'null',
      },
      hcDataLabels: {
        enabled: hcaOpts.plotOptions.series.dataLabels.enabled,
        format: undefined as any,
        style: {'textOutline': '2px contrast', 'stroke-width': 0} // Further inspect this!
      },
      hcZoomOptions: {
        enableXaxisZoom: hcaOpts.xAxis.zoomEnabled,
        enableYaxisZoom: hcaOpts.yAxis.zoomEnabled,
      },
    };

    // 6) Build `appearance.tableAppearance`
    const tableAppearance = { paginationSize: 30 };

    return {
      view,
      category,
      dataseries,
      appearance: {
        chartAppearance: { generalOptions, highchartsAppearanceOptions: hcaOptions },
        tableAppearance,
      },
    };
  }

}
