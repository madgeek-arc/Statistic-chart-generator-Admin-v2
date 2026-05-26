import { ChartInfo } from './chart-query.model';
import type {
  DataZoomComponentOption,
  SeriesOption,
  TitleComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption
} from 'echarts';

export class EChartsChart {
  library: string;
  orderBy: string;
  chartDescription: EChartsDescription;

  constructor() {
    this.library = 'eCharts';
    this.orderBy = 'xaxis';
    this.chartDescription = new EChartsDescription();
  }
}

class EChartsDescription {

  title?: TitleComponentOption;
  xAxis?: XAXisComponentOption;
  yAxis?: YAXisComponentOption;
  series: SeriesOption[];
  backgroundColor?: string;
  tooltip?: TooltipComponentOption;
  dataZoom?: DataZoomComponentOption[];
  color: string[];

  // not Echarts fields
  toolbox: ECToolbox;
  legend: ECLegend;


  queries: Array<ChartInfo> = [];

  constructor() {

    this.title = {} as TitleComponentOption;
    this.yAxis = {} as YAXisComponentOption;
    this.xAxis = {} as XAXisComponentOption;
    this.tooltip = {} as TooltipComponentOption;
    this.toolbox = new ECToolbox();
    this.legend = new ECLegend();
    this.dataZoom = [
      // Xaxis Zoom options
      {show: false},
      // Yaxis Zoom options
      {show: false, yAxisIndex: 0}
    ];
    this.series = [];
  }
}

export class ECToolbox {
  show: boolean;
  right: string | number = 'auto';
  left: string | number = 'auto';
  top: string | number = 'auto';
  bottom: string | number = 'auto';
  feature: ECToolboxFeature;

  constructor() {
    this.show = false;
    this.feature = new ECToolboxFeature();
  }
}

export class ECToolboxFeature {
  saveAsImage: ECToolboxFeatureItem;
  dataView: ECToolboxFeatureItem;

  constructor() {
    this.saveAsImage = new ECToolboxFeatureItem('Save as image');
    this.dataView = new ECToolboxFeatureItem('Data view');
  }
}

export class ECToolboxFeatureItem {
  title: string;

  constructor(title: string) {
    this.title = title;
  }
}

export class ECLegend {
  show: boolean = true;
  orient: 'horizontal' | 'vertical' = 'horizontal';
  right: string | number = 'auto';
  left: string | number = 'auto';
  top: string | number = 'auto';
  bottom: string | number = 'auto';
}

