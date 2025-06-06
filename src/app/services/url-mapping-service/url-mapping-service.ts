import { Injectable } from "@angular/core";
import { DynamicFormHandlingService } from "../dynamic-form-handling-service/dynamic-form-handling.service";
import {
  DiagramCategoryService
} from "../../dashboard/customise-appearance/visualisation-options/diagram-category-service/diagram-category.service";
import {
  ISupportedCategory
} from "../../dashboard/customise-appearance/visualisation-options/supported-chart-types-service/supported-chart-types.service";

@Injectable({ providedIn: 'root' })

export class UrlMappingService {

  constructor(private formHandlingService: DynamicFormHandlingService, private diagramService: DiagramCategoryService) {}

  updateFormObjet(urlJson: UrlJson) {

    this.formHandlingService.loadFormObject = this.reconstructFromUrlJson(urlJson);
  }

  reconstructFromUrlJson(urlJson: UrlJson): FileJson {
    // 1) Build `view`
    const view = {
      profile: urlJson.chartDescription.queries[0]?.query.profile || "monitor",
    };

    // 2) Build `category.diagram` matching polar and type in availableDiagrams
    const category = {
      // type should eventually be inferred from chartDescription.chart.type!'
      diagram: this.diagramService.availableDiagrams.find(d =>
        d.isPolar === urlJson.chartDescription.chart.polar && d.type === urlJson.chartDescription.queries[0].type
      )
    }

    // 3) Build `dataseries`
    const dataseries = urlJson.chartDescription.queries.map((q, index) => {
      // 3a) yaxisData
      const yaxisField = q.query.select[0]; // e.g. { field: "result", aggregate: "count" }
      const yaxisData = {
        entity: yaxisField.field,
        yaxisAggregate: yaxisField.aggregate === "count" ? "total" : yaxisField.aggregate || "",
      };

      // 3b) xaxisData (everything beyond index 0 in `select`)
      const xaxisData = q.query.select.slice(1).map((sel) => ({
        xaxisEntityField: { name: sel.field, type: "int" },
      }));

      // 3c) filters (copy groupFilters verbatim, inferring type)
      const filters = q.query.filters.map((group) => ({
        groupFilters: group.groupFilters.map((f) => ({
          field: {
            name: f.field,
            type: typeof f.values[0] === "string" && /^\d+$/.test(f.values[0]) ? "int" : "text",
          },
          type: f.type,
          values: f.values,
        })),
        op: group.op,
      }));

      // 3d) chartProperties
      const chartProperties = {
        dataseriesColor: q.color,
        dataseriesName: q.name,
        stacking: urlJson.chartDescription.series[index]?.stacking || "normal",
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
  chartDescription: {
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

    // ← Here is where “chart” now lives:
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

