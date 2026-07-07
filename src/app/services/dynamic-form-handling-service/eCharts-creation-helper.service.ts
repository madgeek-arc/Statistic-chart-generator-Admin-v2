import { Injectable } from "@angular/core";
import { BarSeriesOption, LineSeriesOption, PieSeriesOption, SeriesOption } from "echarts";


export type ChartType =
  | 'line'
  | 'bar'
  | 'scatter'
  | 'pie'
  | 'radar'
  | 'map'
  | 'tree'
  | 'treemap'
  | 'graph'
  | 'chord'
  | 'gauge'
  | 'funnel'
  | 'parallel'
  | 'sankey'
  | 'boxplot'
  | 'candlestick'
  | 'effectScatter'
  | 'lines'
  | 'heatmap'
  | 'pictorialBar'
  | 'themeRiver'
  | 'sunburst'
  | 'custom'
  | 'area'; // custom abstraction

interface BaseSeriesConfig {
  // data: any[];
  stack?: boolean;
  showLabels?: boolean;
}

@Injectable({providedIn: 'root'})

export class EChartsCreationHelperService {

  buildLineSeries(config: BaseSeriesConfig & { isArea: boolean }): LineSeriesOption {
    return {
      type: 'line',
      // data: config.data,
      areaStyle: config.isArea ? {} : undefined,
      stack: config.stack ? 'stack' : undefined,
      label: {
        show: config.showLabels ?? false
      }
    };
  }

  buildBarSeries(config: BaseSeriesConfig): BarSeriesOption {
    return {
      type: 'bar',
      // data: config.data,
      stack: config.stack ? 'stack' : undefined,
      label: {
        show: config.showLabels ?? false
      }
    };
  }

  buildPieSeries(config: BaseSeriesConfig): PieSeriesOption {
    return {
      type: 'pie',
      // data: config.data
    };
  }

  buildSeries(type: string, config: BaseSeriesConfig): SeriesOption {
    switch (type) {
      case 'area':
        return this.buildLineSeries({ ...config, isArea: true });

      case 'line':
        return this.buildLineSeries({ ...config, isArea: false });

      case 'bar':
        return this.buildBarSeries(config);

      case 'column': // Column not supported use bar
        return this.buildBarSeries(config);

      case 'pie':
        return this.buildPieSeries(config);

      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }
}
