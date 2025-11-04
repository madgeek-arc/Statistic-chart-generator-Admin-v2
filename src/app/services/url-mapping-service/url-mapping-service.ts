import { Injectable } from "@angular/core";
import { DynamicFormHandlingService } from "../dynamic-form-handling-service/dynamic-form-handling.service";
import { DiagramCategoryService } from "../diagram-category-service/diagram-category.service";
import { ISupportedCategory } from "../supported-chart-types-service/supported-chart-types.service";
import { ChartInfo } from "../supported-libraries-service/models/chart-query.model";
import { DynamicTreeDatabase } from "../dynamic-tree-database/dynamic-tree-database.service";

@Injectable({ providedIn: 'root' })
export class UrlMappingService {

  constructor(private formHandlingService: DynamicFormHandlingService,
              private diagramService: DiagramCategoryService,
              private dynamicTreeDatabase: DynamicTreeDatabase) {}

  updateFormObjet(urlJson: UrlJson | any) {
    this.formHandlingService.loadFormObject = this.reconstructFromUrlJson(urlJson);
    // console.log(this.formHandlingService.loadFormObject);
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

    for (let i = 0; i < pathParts.length; i++) {
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

  reconstructFromUrlJson(urlJson: UrlJson | any): FileJson {
    // Defensive guard
    if (!urlJson || typeof urlJson !== 'object') {
      throw new Error('Invalid urlJson provided');
    }

    // determine library
    const library = urlJson.library;

    // If it's HighMaps, the payload may be under mapDescription (root) or under chartDescription
    if (library === 'HighMaps') {
      const mapDesc = urlJson.mapDescription;

      // view.profile - try to find the profile inside the first query
      const profile = mapDesc.queries?.[0]?.query?.profile ?? 'elastic';

      // pick a diagram: try to match query.type or fallback to a map-like diagram
      const firstQueryType = mapDesc.queries?.[0]?.type ?? 'world';
      let diagram: ISupportedCategory | undefined =
        this.diagramService.availableDiagrams.find(d => d.type === firstQueryType) ||
        this.diagramService.availableDiagrams.find(d => d.type?.toLowerCase().includes('map')) ||
        this.diagramService.availableDiagrams[0];

      // build dataseries similar to charts but adapted for maps
      const dataseries = (mapDesc.queries ?? []).map((q: any, index: number) => {
        const yaxisField = q.query?.select?.[0] ?? { field: '', aggregate: '' };
        const yaxisData = {
          entity: yaxisField.field,
          yaxisAggregate: yaxisField.aggregate === 'count' ? 'total' : (yaxisField.aggregate || '')
        };

        const xaxisData = (q.query?.select ?? []).slice(1).map((sel: any) => ({
          xaxisEntityField: { name: sel.field, type: 'text' } // country codes are text
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
        library: library,
        resultsLimit: parseInt(mapDesc.queries?.[0]?.query?.limit ?? '0', 10),
        orderByAxis: urlJson.orderBy ?? 'xaxis'
      };

      // Build highchartsAppearanceOptions but include map-specific options inside hcMapOptions
      const hcaOptions: any = {
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
        xAxis: {
          xAxisText: mapDesc.xAxis?.title?.text ?? '',
          color: mapDesc.xAxis?.title?.style?.color ?? '#666666FF',
          fontSize: parseFloat((mapDesc.xAxis?.title?.style?.fontSize ?? '11').toString())
        },
        yAxis: {
          yAxisText: mapDesc.yAxis?.title?.text ?? '',
          color: mapDesc.yAxis?.title?.style?.color ?? '#666666FF',
          fontSize: parseFloat((mapDesc.yAxis?.title?.style?.fontSize ?? '11').toString()),
          reversedStacks: mapDesc.yAxis?.reversedStacks ?? false
        },
        dataSeriesColorArray: mapDesc.colors ?? [],
        hcChartArea: {
          hcCABackGroundColor: mapDesc.chart?.backgroundColor ?? '#FFFFFFFF',
          hcCABorderWidth: mapDesc.chart?.borderWidth ?? 0,
          hcCABorderCornerRadius: mapDesc.chart?.borderRadius ?? 0,
          hcCABorderColor: mapDesc.chart?.borderColor ?? '#00000000'
        },
        hcPlotArea: {
          hcPABorderWidth: mapDesc.chart?.plotBorderWidth ?? 0,
          hcPABorderColor: mapDesc.chart?.plotBorderColor ?? '#00000000'
        },
        hcCredits: {
          hcEnableCredits: mapDesc.credits?.enabled ?? false
        },
        hcLegend: {
          hcEnableLegend: mapDesc.legend?.enabled ?? true,
          hcLegendLayout: mapDesc.legend?.layout ?? 'horizontal',
          hcLegendHorizontalAlignment: mapDesc.legend?.align ?? 'center',
          hcLegendVerticalAlignment: mapDesc.legend?.verticalAlign ?? 'bottom'
        },
        hcMiscOptions: {
          exporting: mapDesc.exporting?.enabled ?? true,
          // store the raw map-specific fields here so your UI/chart builder can access them:
          colorAxis: mapDesc.colorAxis ?? null,
          map: mapDesc.chart?.map ?? null,
          mapNavigation: mapDesc.mapNavigation ?? null,
          zoomTo: mapDesc.zoomTo ?? null,
          // keep stacking default for compatibility
          stackedChart: mapDesc.plotOptions?.series?.stacking ?? 'normal'
        },
        hcDataLabels: {
          enabled: mapDesc.series?.[0]?.dataLabels?.enabled ?? false
        },
        hcZoomOptions: {
          enableXaxisZoom: mapDesc.xAxis?.zoomEnabled ?? false,
          enableYaxisZoom: mapDesc.yAxis?.zoomEnabled ?? false
        },
        // keep the original raw series for maps (useful for joins/keys)
        hcMapOptions: {
          series: mapDesc.series ?? [],
          keys: mapDesc.series?.[0]?.keys ?? [],
          joinBy: mapDesc.series?.[0]?.joinBy ?? 'iso-a2'
        }
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
            highchartsAppearanceOptions: hcaOptions
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
          if (index > 0) // If there are more than one type mismatch, set the chart type to combo
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

    // 3) Build `dataseries`
    const dataseries = urlJson.chartDescription.queries.map((q: ChartInfo, index: number) => {

      // 3a) yaxisData
      const yaxisField = {...q.query.select[0]}; // e.g. { field: "result", aggregate: "count" }
      if (yaxisField.field === q.query.entity && yaxisField.aggregate === 'count') {
        yaxisField.aggregate = 'total';
      }

      const yaxisData = {
        entity: q.query.entity,
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
          type: this.getFieldType(q.query.entity, yaxisField.field) // Look up type dynamically
        },
      }));

      // 3c) filters (copy groupFilters verbatim, inferring type)
      const filters = q.query.filters.map((group) => ({
        groupFilters: group.groupFilters.map((f) => ({
          field: {
            name: f.field,
            type: this.getFieldType(q.query.entity, f.field), // Look up type dynamically
            // type: typeof f.values[0] === "string" && /^\d+$/.test(f.values[0]) ? "int" : "text",
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
        stacking: urlJson.chartDescription.series[index]?.stacking || 'null',
      };

      return {
        data: { yaxisData, xaxisData, filters },
        chartProperties,
      };
    });

    // 4) Build `appearance.chartAppearance.generalOptions`
    const generalOptions = {
      library: urlJson.library,
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
      dataSeriesColorArray: hcaOpts.colors,
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
      },
      hcLegend: {
        hcEnableLegend: hcaOpts.legend.enabled,
        hcLegendLayout: hcaOpts.legend.layout,
        hcLegendHorizontalAlignment: hcaOpts.legend.align,
        hcLegendVerticalAlignment: hcaOpts.legend.verticalAlign,
      },
      hcMiscOptions: {
        exporting: hcaOpts.exporting.enabled,
        stackedChart: hcaOpts.plotOptions.series.stacking,
      },
      hcDataLabels: {
        enabled: hcaOpts.plotOptions.series.dataLabels.enabled,
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

interface UrlJson {
  library: string;
  orderBy: string;
  chartDescription?: {
    queries: Array<{
      name: string;
      type: string;
      color: string;
      query: {
        parameters: any[];
        select: Array<{ field: string; aggregate: string | null }>;
        filters: Array<{
          groupFilters: Array<{ field: string; type: string; values: string[] }>;
          op: "AND" | "OR";
        }>;
        entity: string;
        profile: string;
        limit: string;
      };
    }>;
    colors: string[];
    series: Array<{ stacking: string }>;

    chart: {
      type: string;
      polar: boolean;
      backgroundColor: string;
      borderColor: string;
      borderRadius: number;
      borderWidth: number;
      plotBorderColor: string;
      plotBorderWidth: number;
      zoomType: string;
    };

    title: {
      style: { color: string; fontSize: string };
      text: string;
      margin: number;
      align: string;
    };

    subtitle: {
      style: { color: string; fontSize: string };
      text: string;
      align: string;
    };

    yAxis: {
      title: { style: { color: string; fontSize: string }; text: string };
      zoomEnabled: boolean;
      reversedStacks: boolean;
    };

    xAxis: {
      title: { style: { color: string; fontSize: string }; text: string };
      zoomEnabled: boolean;
    };

    lang: { noData: string };
    exporting: { enabled: boolean };

    plotOptions: {
      series: {
        dataLabels: { enabled: boolean; style: any };
        stacking: string;
      };
    };

    legend: { layout: string; align: string; verticalAlign: string; enabled: boolean };
    credits: { enabled: boolean; href: string | null };
    tooltip: { style: any };
  };
  mapDescription?: any;
}


interface FileJson {
  view: { profile: string };
  category: {
    diagram?: ISupportedCategory;
  };
  dataseries: Array<{
    data: {
      yaxisData: { entity: string; yaxisAggregate: string };
      xaxisData: Array<{ xaxisEntityField: { name: string; type: string } }>;
      filters: Array<{
        groupFilters: Array<{ field: { name: string; type: string }; type: string; values: string[] }>;
        op: "AND" | "OR";
      }>;
    };
    chartProperties: { dataseriesColor: string; dataseriesName: string; stacking: string };
  }>;
  appearance: {
    chartAppearance: {
      generalOptions: { library: string; resultsLimit: number; orderByAxis: string };
      highchartsAppearanceOptions: {
        title: { titleText: string; color: string; fontSize: number; align: string; margin: number };
        subtitle: { subtitleText: string; color: string; fontSize: number; align: string };
        xAxis: { xAxisText: string; color: string; fontSize: number };
        yAxis: { yAxisText: string; color: string; fontSize: number; reversedStacks: boolean };
        dataSeriesColorArray: string[];
        hcChartArea: {
          hcCABackGroundColor: string;
          hcCABorderWidth: number;
          hcCABorderCornerRadius: number;
          hcCABorderColor: string;
        };
        hcPlotArea: { hcPABorderWidth: number; hcPABorderColor: string };
        hcCredits: { hcEnableCredits: boolean };
        hcLegend: {
          hcEnableLegend: boolean;
          hcLegendLayout: string;
          hcLegendHorizontalAlignment: string;
          hcLegendVerticalAlignment: string;
        };
        hcMiscOptions: { exporting: boolean; stackedChart: string };
        hcDataLabels: { enabled: boolean };
        hcZoomOptions: { enableXaxisZoom: boolean; enableYaxisZoom: boolean };
      };
    };
    tableAppearance: { paginationSize: number };
  };
}


/* ---------- INTERFACES (kept for convenience) ---------- */

// interface UrlJson {
//   library?: string;
//   orderBy?: string;
//   chartDescription?: any; // kept loose to tolerate both chartDescription and mapDescription shapes
//   mapDescription?: any;
// }

// interface FileJson {
//   view: { profile: string };
//   category: {
//     diagram?: ISupportedCategory;
//   };
//   dataseries: Array<{
//     data: {
//       yaxisData: { entity: string; yaxisAggregate: string };
//       xaxisData: Array<{ xaxisEntityField: { name: string; type: string } }>;
//       filters: Array<{
//         groupFilters: Array<{ field: { name: string; type: string }; type: string; values: string[] }>;
//         op: "AND" | "OR";
//       }>;
//     };
//     chartProperties: { chartType?: string; dataseriesColor: string; dataseriesName: string; stacking: string };
//   }>;
//   appearance: {
//     chartAppearance: {
//       generalOptions: { library: string; resultsLimit: number; orderByAxis: string };
//       highchartsAppearanceOptions: any; // allowed to contain map-specific hcMapOptions
//     };
//     tableAppearance: { paginationSize: number };
//   };
// }





















// import { Injectable } from "@angular/core";
// import { DynamicFormHandlingService } from "../dynamic-form-handling-service/dynamic-form-handling.service";
// import {
//   DiagramCategoryService
// } from "../diagram-category-service/diagram-category.service";
// import {
//   ISupportedCategory
// } from "../supported-chart-types-service/supported-chart-types.service";
//
// @Injectable({ providedIn: 'root' })
//
// export class UrlMappingService {
//
//   constructor(private formHandlingService: DynamicFormHandlingService, private diagramService: DiagramCategoryService) {}
//
//   updateFormObjet(urlJson: UrlJson) {
//
//     this.formHandlingService.loadFormObject = this.reconstructFromUrlJson(urlJson);
//     console.log(this.formHandlingService.loadFormObject);
//   }
//
//   reconstructFromUrlJson(urlJson: UrlJson): FileJson {
//     // 1) Build `view`
//     const view = {
//       profile: urlJson.chartDescription.queries[0]?.query.profile,
//     };
//
//     // Check if the chart type is line, if so, there is a possibility that the chart type is not set correctly
//     let chartType = urlJson.chartDescription.chart.type;
//     if (urlJson.chartDescription.chart.type === 'line') {
//       urlJson.chartDescription.queries.forEach((q, index) => {
//         if (q.type !== chartType) { // Not a line series found
//           chartType = q.type; // Set the chart type to the first non-line series
//           if (index > 0) // If there are more than one type mismatch, set the chart type to combo
//             chartType = 'combo';
//         }
//       });
//     }
//     // 2) Build `category.diagram` matching polar and type in availableDiagrams
//     const category = {
//       // type should eventually be inferred from chartDescription.chart.type!'
//       diagram: this.diagramService.availableDiagrams.find(d =>
//         d.isPolar === urlJson.chartDescription.chart.polar && d.type === chartType
//       )
//     }
//
//     // 3) Build `dataseries`
//     const dataseries = urlJson.chartDescription.queries.map((q, index) => {
//       // 3a) yaxisData
//       const yaxisField = q.query.select[0]; // e.g. { field: "result", aggregate: "count" }
//       const yaxisData = {
//         entity: yaxisField.field,
//         yaxisAggregate: yaxisField.aggregate === "count" ? "total" : yaxisField.aggregate || "",
//       };
//
//       // 3b) xaxisData (everything beyond index 0 in `select`)
//       const xaxisData = q.query.select.slice(1).map((sel) => ({
//         xaxisEntityField: { name: sel.field, type: "int" },
//       }));
//
//       // 3c) filters (copy groupFilters verbatim, inferring type)
//       const filters = q.query.filters.map((group) => ({
//         groupFilters: group.groupFilters.map((f) => ({
//           field: {
//             name: f.field,
//             type: typeof f.values[0] === "string" && /^\d+$/.test(f.values[0]) ? "int" : "text",
//           },
//           type: f.type,
//           values: f.values,
//         })),
//         op: group.op,
//       }));
//
//       // 3d) chartProperties
//       const chartProperties = {
//         chartType: q.type,
//         dataseriesColor: q.color,
//         dataseriesName: q.name,
//         stacking: urlJson.chartDescription.series[index]?.stacking || 'null',
//       };
//
//       return {
//         data: { yaxisData, xaxisData, filters },
//         chartProperties,
//       };
//     });
//
//     // 4) Build `appearance.chartAppearance.generalOptions`
//     const generalOptions = {
//       library: urlJson.library,
//       resultsLimit: parseInt(urlJson.chartDescription.queries[0]?.query.limit || "30", 10),
//       orderByAxis: urlJson.orderBy,
//     };
//
//     // 5) Build `appearance.chartAppearance.highchartsAppearanceOptions`
//     const hcaOpts = urlJson.chartDescription;
//     const hcaOptions = {
//       title: {
//         titleText: hcaOpts.title.text,
//         color: hcaOpts.title.style.color,
//         fontSize: parseFloat(hcaOpts.title.style.fontSize),
//         align: hcaOpts.title.align,
//         margin: hcaOpts.title.margin,
//       },
//       subtitle: {
//         subtitleText: hcaOpts.subtitle.text,
//         color: hcaOpts.subtitle.style.color,
//         fontSize: parseFloat(hcaOpts.subtitle.style.fontSize),
//         align: hcaOpts.subtitle.align,
//       },
//       xAxis: {
//         xAxisText: hcaOpts.xAxis.title.text,
//         color: hcaOpts.xAxis.title.style.color,
//         fontSize: parseFloat(hcaOpts.xAxis.title.style.fontSize),
//       },
//       yAxis: {
//         yAxisText: hcaOpts.yAxis.title.text,
//         color: hcaOpts.yAxis.title.style.color,
//         fontSize: parseFloat(hcaOpts.yAxis.title.style.fontSize),
//         reversedStacks: hcaOpts.yAxis.reversedStacks,
//       },
//       dataSeriesColorArray: hcaOpts.colors,
//       hcChartArea: {
//         hcCABackGroundColor: hcaOpts.chart.backgroundColor,
//         hcCABorderWidth: hcaOpts.chart.borderWidth,
//         hcCABorderCornerRadius: hcaOpts.chart.borderRadius,
//         hcCABorderColor: hcaOpts.chart.borderColor,
//       },
//       hcPlotArea: {
//         hcPABorderWidth: hcaOpts.chart.plotBorderWidth,
//         hcPABorderColor: hcaOpts.chart.plotBorderColor,
//       },
//       hcCredits: {
//         hcEnableCredits: hcaOpts.credits.enabled,
//       },
//       hcLegend: {
//         hcEnableLegend: hcaOpts.legend.enabled,
//         hcLegendLayout: hcaOpts.legend.layout,
//         hcLegendHorizontalAlignment: hcaOpts.legend.align,
//         hcLegendVerticalAlignment: hcaOpts.legend.verticalAlign,
//       },
//       hcMiscOptions: {
//         exporting: hcaOpts.exporting.enabled,
//         stackedChart: hcaOpts.plotOptions.series.stacking,
//       },
//       hcDataLabels: {
//         enabled: hcaOpts.plotOptions.series.dataLabels.enabled,
//       },
//       hcZoomOptions: {
//         enableXaxisZoom: hcaOpts.xAxis.zoomEnabled,
//         enableYaxisZoom: hcaOpts.yAxis.zoomEnabled,
//       },
//     };
//
//     // 6) Build `appearance.tableAppearance`
//     const tableAppearance = { paginationSize: 30 };
//
//     return {
//       view,
//       category,
//       dataseries,
//       appearance: {
//         chartAppearance: { generalOptions, highchartsAppearanceOptions: hcaOptions },
//         tableAppearance,
//       },
//     };
//   }
//
// }
//
// interface UrlJson {
//   library: string;
//   orderBy: string;
//   chartDescription: {
//     queries: Array<{
//       name: string;
//       type: string;
//       color: string;
//       query: {
//         parameters: any[];
//         select: Array<{ field: string; aggregate: string | null }>;
//         filters: Array<{
//           groupFilters: Array<{ field: string; type: string; values: string[] }>;
//           op: "AND" | "OR";
//         }>;
//         entity: string;
//         profile: string;
//         limit: string;
//       };
//     }>;
//     colors: string[];
//     series: Array<{ stacking: string }>;
//
//     chart: {
//       type: string;
//       polar: boolean;
//       backgroundColor: string;
//       borderColor: string;
//       borderRadius: number;
//       borderWidth: number;
//       plotBorderColor: string;
//       plotBorderWidth: number;
//       zoomType: string;
//     };
//
//     title: {
//       style: { color: string; fontSize: string };
//       text: string;
//       margin: number;
//       align: string;
//     };
//
//     subtitle: {
//       style: { color: string; fontSize: string };
//       text: string;
//       align: string;
//     };
//
//     yAxis: {
//       title: { style: { color: string; fontSize: string }; text: string };
//       zoomEnabled: boolean;
//       reversedStacks: boolean;
//     };
//
//     xAxis: {
//       title: { style: { color: string; fontSize: string }; text: string };
//       zoomEnabled: boolean;
//     };
//
//     lang: { noData: string };
//     exporting: { enabled: boolean };
//
//     plotOptions: {
//       series: {
//         dataLabels: { enabled: boolean; style: any };
//         stacking: string;
//       };
//     };
//
//     legend: { layout: string; align: string; verticalAlign: string; enabled: boolean };
//     credits: { enabled: boolean; href: string | null };
//     tooltip: { style: any };
//   };
// }
//
//
// interface FileJson {
//   view: { profile: string };
//   category: {
//     diagram?: ISupportedCategory;
//   };
//   dataseries: Array<{
//     data: {
//       yaxisData: { entity: string; yaxisAggregate: string };
//       xaxisData: Array<{ xaxisEntityField: { name: string; type: string } }>;
//       filters: Array<{
//         groupFilters: Array<{ field: { name: string; type: string }; type: string; values: string[] }>;
//         op: "AND" | "OR";
//       }>;
//     };
//     chartProperties: { dataseriesColor: string; dataseriesName: string; stacking: string };
//   }>;
//   appearance: {
//     chartAppearance: {
//       generalOptions: { library: string; resultsLimit: number; orderByAxis: string };
//       highchartsAppearanceOptions: {
//         title: { titleText: string; color: string; fontSize: number; align: string; margin: number };
//         subtitle: { subtitleText: string; color: string; fontSize: number; align: string };
//         xAxis: { xAxisText: string; color: string; fontSize: number };
//         yAxis: { yAxisText: string; color: string; fontSize: number; reversedStacks: boolean };
//         dataSeriesColorArray: string[];
//         hcChartArea: {
//           hcCABackGroundColor: string;
//           hcCABorderWidth: number;
//           hcCABorderCornerRadius: number;
//           hcCABorderColor: string;
//         };
//         hcPlotArea: { hcPABorderWidth: number; hcPABorderColor: string };
//         hcCredits: { hcEnableCredits: boolean };
//         hcLegend: {
//           hcEnableLegend: boolean;
//           hcLegendLayout: string;
//           hcLegendHorizontalAlignment: string;
//           hcLegendVerticalAlignment: string;
//         };
//         hcMiscOptions: { exporting: boolean; stackedChart: string };
//         hcDataLabels: { enabled: boolean };
//         hcZoomOptions: { enableXaxisZoom: boolean; enableYaxisZoom: boolean };
//       };
//     };
//     tableAppearance: { paginationSize: number };
//   };
// }
//
