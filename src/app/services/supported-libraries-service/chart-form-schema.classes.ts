// Classes derived from the chart-form-schema.model

import { ISupportedCategory } from "../supported-chart-types-service/supported-chart-types.service";
import {
  HCDataLabels,
  HCZoomOptionsFormSchema
} from "./models/chart-description-HighCharts.model";

export interface SCGAFormSchema {
  view: ViewFormSchema;
  category: CategoryFormSchema;
  dataseries: DataseriesFormSchema[];
  appearance: AppearanceFormSchema;
}

export interface ViewFormSchema {
  profile: string;
}

export interface CategoryFormSchema {
  diagram: ISupportedCategory;
}

export interface DataseriesFormSchema {
  data: DataFormSchema;
  chartProperties: ChartPropertiesFormSchema;
}

export interface DataFormSchema {
  yaxisData: YaxisDataFormSchema;
  xaxisData: XaxisDataFormSchema[];
  filters: FilterFormSchema[];
}

export interface YaxisDataFormSchema {
  entity: string;
  yaxisAggregate: string;
  yaxisEntityField?: EntityFieldFormSchema;
}

export interface XaxisDataFormSchema {
  xaxisEntityField: EntityFieldFormSchema;
}

export interface FilterFormSchema {
  groupFilters: FilterGroupSchema[];
  op: string;
}

export interface FilterGroupSchema {
  field: EntityFieldFormSchema;
  type: string;
  values: string[];
}

export interface EntityFieldFormSchema {
  name: string;
  type?: string;
}

export interface ChartPropertiesFormSchema {
  chartType?: string;
  dataseriesColor?: string;
  dataseriesName?: string;
  stackName?: string;
  stacking?: 'null' | 'normal' | 'percent' | 'stream' | 'overlap';
}

export interface TitlesOptionsFormSchema {
  title?: string;
  subtitle?: string;
}

export interface AxisNamesFormSchema {
  yaxisName?: string;
  xaxisName?: string;
}

export interface AppearanceFormSchema {
  tableAppearance: TableAppearanceFormSchema;
  chartAppearance: ChartAppearanceFormSchema;
}

export interface HighchartsOptionsFormSchema {
  title?: TitleOptionsFormSchema;
  subtitle?: SubtitleOptionsFormSchema;
  xAxis?: XAxisOptionsFormSchema;
  yAxis?: YAxisOptionsFormSchema;
  dataSeriesColorArray?: Array<string>;
  hcChartArea?: HCChartAreaOptionsFormSchema;
  hcPlotArea?: HCPlotAreaOptionsFormSchema;
  hcCredits?: HCCreditsOptionsFormSchema;
  hcLegend?: HCLegendOptionsFormSchema;
  hcMiscOptions?: HCMiscOptionsFormSchema;
  hcDataLabels?: HCDataLabels;
  hcZoomOptions?: HCZoomOptionsFormSchema;
}

export interface EchartsOptionsFormSchema {
  titles?: TitlesOptionsFormSchema;
  axisNames?: AxisNamesFormSchema;
  dataSeriesColorArray?: Array<string>;
  ecChartArea?: ECChartAreaOptionsFormSchema;
  ecLegend?: ECLegendOptionsFormSchema;
  ecMiscOptions?: ECMiscOptionsFormSchema;
  ecZoomOptions?: ECZoomOptionsFormSchema;
}

export interface HighmapsOptionsFormSchema {
  title?: TitleOptionsFormSchema;
  subtitle?: SubtitleOptionsFormSchema;
  hmCredits?: HMCreditsOptionsFormSchema;
  hmLegend?: HMLegendOptionsFormSchema;
  hmMiscOptions?: HMMiscOptionsFormSchema;
  hmColorAxis?: HMColorAxisOptionsFormSchema;
  hmZoomTo?: { destination: string, zoomValue: number };
}

export interface TitleOptionsFormSchema {
  titleText?: string;
  color?: string;
  align?: "left" | "center" | "right";
  margin?: number;
  fontSize?: number;
}

export interface SubtitleOptionsFormSchema {
  subtitleText?: string;
  color?: string;
  align?: "left" | "center" | "right";
  fontSize?: number;
}

export interface XAxisOptionsFormSchema {
  xAxisText?: string;
  color?: string;
  fontSize?: number;
}

export interface YAxisOptionsFormSchema {
  yAxisText?: string;
  color?: string;
  fontSize?: number;
  reversedStacks?: boolean;
}

export interface HMColorAxisOptionsFormSchema {
  hmColorAxisMin?: number;
  hmColorAxisMax?: number;
  hmColorAxisType?: string;
  hmColorAxisMinColor?: string;
  hmColorAxisMaxColor?: string;
}

export interface HMLegendOptionsFormSchema {
  hmEnableLegend?: boolean;
  hmLegendTitle?: string;
}

export interface HMCreditsOptionsFormSchema {
  hmEnableCredits?: boolean;
  hmCreditsText?: string;
}

export interface HMMiscOptionsFormSchema {
  exporting?: boolean;
  hmEnableDataLabels?: boolean;
  hmEnableMapNavigation?: boolean;
}

export interface HCChartAreaOptionsFormSchema {
  hcCABackGroundColor?: string;
  hcCABorderWidth?: number;
  hcCABorderCornerRadius?: number;
  hcCABorderColor?: string;
}

export interface HCPlotAreaOptionsFormSchema {
  hcPABackgroundColor?: string;
  hcPABackgroundImageURL?: string;
  hcPABorderWidth?: number;
  hcPABorderColor?: string;
}

export interface HCCreditsOptionsFormSchema {
  hcEnableCredits?: boolean;
  hcCreditsText?: string;
}

export interface HCLegendOptionsFormSchema {
  hcEnableLegend?: boolean;
  hcLegendLayout?: "horizontal" | "vertical" | "proximate";
  hcLegendHorizontalAlignment?: "left" | "center" | "right";
  hcLegendVerticalAlignment?: "bottom" | "top" | "middle";
}

export interface ECLegendOptionsFormSchema {
  ecEnableLegend?: boolean;
  ecLegendLayout?: "horizontal" | "vertical";
  ecLegendHorizontalAlignment?: string;
  ecLegendVerticalAlignment?: string;
}

export interface ECChartAreaOptionsFormSchema {
  ecCABackGroundColor?: string;
}

export interface ECMiscOptionsFormSchema {
  exporting?: boolean;
  ecEnableDataLabels?: boolean;
  stackedChart?: boolean;
}

export interface ECZoomOptionsFormSchema {
  enableXaxisZoom?: boolean;
  enableYaxisZoom?: boolean;
}

export interface HCMiscOptionsFormSchema {
  exporting?: boolean;
  drilldown?: boolean;
  hcEnableDataLabels?: boolean;
  stackedChart?: "null" | "normal" | "percent" | "stream" | "overlap";
}

export interface GooglechartsOptionsFormSchema {

  titles?: TitlesOptionsFormSchema;
  axisNames?: AxisNamesFormSchema;
  exporting?: boolean;
  stackedChart?: string;
  gcCABackGroundColor?: string;
  gcPABackgroundColor?: string;
}

export interface ChartAppearanceFormSchema {
  generalOptions: AppearanceGeneralOptionsFormSchema;

  highchartsAppearanceOptions?: HighchartsOptionsFormSchema;
  echartsAppearanceOptions?: EchartsOptionsFormSchema;
  googlechartsAppearanceOptions?: GooglechartsOptionsFormSchema;
  highmapsAppearanceOptions?: HighmapsOptionsFormSchema;
}

export interface AppearanceGeneralOptionsFormSchema {
  visualisationLibrary: string;
  resultsLimit: number;
  orderByAxis?: string;
}

export interface TableAppearanceFormSchema {
  paginationSize?: number;
}
