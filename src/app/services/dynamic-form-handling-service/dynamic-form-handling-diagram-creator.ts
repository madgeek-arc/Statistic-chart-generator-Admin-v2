import { Observable, of } from 'rxjs';
import { Color, ColorType } from 'highcharts';
import {
  HighChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model";
import {
  DiagramCategoryService
} from "../../dashboard/customise-appearance/visualisation-options/diagram-category-service/diagram-category.service";
import {
  AppearanceFormSchema,
  CategoryFormSchema,
  DataseriesFormSchema,
  SCGAFormSchema,
  ViewFormSchema
} from "../../dashboard/customise-appearance/visualisation-options/chart-form-schema.classes";
import {
  GoogleChartsChart,
  GoogleChartsTable
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model";
import {
  HighMapsMap,
  HMSeriesInfo
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model";
import {
  EChartsChart,
  ECToolboxFeature
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model";
import { ChartInfo } from "../../dashboard/customise-appearance/visualisation-options/chart-query.model";
import {
  RawChartDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model";
import {
  QueryInfo,
  RawDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/description-rawData.model";
import { EChartOption } from "echarts";
import {
  ISupportedMap
} from "../../dashboard/customise-appearance/visualisation-options/supported-chart-types-service/supported-chart-types.service";


export class DiagramCreator {

	private hcColorTheme = ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'];
	private ecColorTheme = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074',
		'#546570', '#c4ccd3'];

	constructor(private diagramCategoryService: DiagramCategoryService) { }

	public createChart(formObj: SCGAFormSchema): Observable<HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null> {

		const view: ViewFormSchema = formObj.view;
		const category: CategoryFormSchema = formObj.category;
		const dataseries: DataseriesFormSchema[] = formObj.dataseries;
		const appearanceOptions: AppearanceFormSchema = formObj.appearance;
		const library: string = appearanceOptions.chartAppearance.generalOptions.visualisationLibrary;

		// TODO we can make sure we dont send to the back end queries with unsupported libraries
		// ----------------------
		// this.supportedLibrariesService.getSupportedLibraries().subscribe(
		// (data: Array<string>) =>  {
		//     if (data.includes(library)) {

		switch (library) {

			case ('HighCharts'): {
				const hchartObj = this.createDynamicHighChartsChart(view, category, dataseries, appearanceOptions);
				console.log('Creating a ' + library + ' chart!', hchartObj);

				return of(hchartObj);
			}
			case ('GoogleCharts'): {
				const gchartObj = this.createDynamicGoogleChartsChart(view, category, dataseries, appearanceOptions);
				console.log('Creating a ' + library + ' chart!', gchartObj);

				return of(gchartObj);
			}
			case ('HighMaps'): {
				const hmapObj = this.createDynamicHighMapsMap(view, category, dataseries, appearanceOptions);
				console.log('Creating a ' + library + ' chart!', hmapObj);
				return of(hmapObj);
			}
			case ('eCharts'): {
				const echartObj = this.createDynamicEChartsChart(view, category, dataseries, appearanceOptions);
				console.log('Creating a ' + library + ' chart!', echartObj);

				return of(echartObj);
			}
			default: {
				return of(null);
			}
		}
		// }});
	}

	public createTable(formObj: SCGAFormSchema): Observable<GoogleChartsTable> {

		const view: ViewFormSchema = formObj.view;
		const category: CategoryFormSchema = formObj.category;
		const dataseries: DataseriesFormSchema[] = formObj.dataseries;
		const appearanceOptions: AppearanceFormSchema = formObj.appearance;

		const tableObj = new GoogleChartsTable();

		dataseries.forEach(dataElement => {
			tableObj.tableDescription.queriesInfo.push(new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit, this.figureCategoryType(dataElement, category)));
		});

		tableObj.tableDescription.options.pageSize = formObj.appearance.tableAppearance.paginationSize as number;
		return of(tableObj);
	}

	public createRawChartData(formObj: SCGAFormSchema): Observable<RawChartDataModel> {

		const view: ViewFormSchema = formObj.view;
		const category: CategoryFormSchema = formObj.category;
		const dataseries: DataseriesFormSchema[] = formObj.dataseries;
		const appearanceOptions: AppearanceFormSchema = formObj.appearance;
		const library: string = appearanceOptions.chartAppearance.generalOptions.visualisationLibrary;

		const rawChartDataModel = new RawChartDataModel(library);
		if (appearanceOptions.chartAppearance.generalOptions && appearanceOptions.chartAppearance.generalOptions.orderByAxis !== null) {
			rawChartDataModel.orderBy = appearanceOptions.chartAppearance.generalOptions.orderByAxis as string;
		}

		dataseries.forEach(dataElement => {
			rawChartDataModel.chartsInfo.push(
				new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit,
					this.figureCategoryType(dataElement, category)));
		});
		console.log('Creating a rawChartData model!', rawChartDataModel);
		return of(rawChartDataModel);
	}

	public createRawData(formObj: SCGAFormSchema): Observable<RawDataModel> {

		const view: ViewFormSchema = formObj.view;
		// const category: CategoryFormSchema = formObj.category;
		const dataseries: DataseriesFormSchema[] = formObj.dataseries;
		const appearanceOptions: AppearanceFormSchema = formObj.appearance;

		const rawDataModel = new RawDataModel();
		if (appearanceOptions.chartAppearance.generalOptions && appearanceOptions.chartAppearance.generalOptions.orderByAxis !== null) {
			rawDataModel.orderBy = appearanceOptions.chartAppearance.generalOptions.orderByAxis as string;
		}

		dataseries.forEach(dataElement => {
			rawDataModel.series.push(
				new QueryInfo(dataElement.data, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit.toString()));
		});
		console.log('Creating a rawData model!', rawDataModel);
		return of(rawDataModel);
	}

	createDynamicGoogleChartsChart(view: ViewFormSchema, category: CategoryFormSchema, dataseries: DataseriesFormSchema[], appearanceOptions: AppearanceFormSchema): GoogleChartsChart {

		const chartObj = new GoogleChartsChart();
		const chartDescription = chartObj.chartDescription;

		chartDescription.GoogleChartType = category.diagram.type;

		if (appearanceOptions.chartAppearance.generalOptions !== undefined
			&& appearanceOptions.chartAppearance.generalOptions.orderByAxis !== null) {
			chartObj.orderBy = appearanceOptions.chartAppearance.generalOptions.orderByAxis as string;
		}

		if (appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.titles) {
			chartDescription.options.title = appearanceOptions.chartAppearance.googlechartsAppearanceOptions.titles.title;
		}
		chartDescription.options.exporting = appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.exporting as boolean;
		chartDescription.options.isStacked = appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.stackedChart as string;

		if (appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.gcCABackGroundColor) {
			chartDescription.options.backgroundColor =
				appearanceOptions.chartAppearance.googlechartsAppearanceOptions.gcCABackGroundColor.substring(0, 7);
		}
		if (appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.gcPABackgroundColor) {
			chartDescription.options.chartArea.backgroundColor =
				appearanceOptions.chartAppearance.googlechartsAppearanceOptions.gcPABackgroundColor.substring(0, 7);
		}

		if (appearanceOptions.chartAppearance.googlechartsAppearanceOptions?.axisNames) {
			chartDescription.options.hAxis.title = appearanceOptions.chartAppearance.googlechartsAppearanceOptions.axisNames.xaxisName;
			chartDescription.options.vAxis.title = appearanceOptions.chartAppearance.googlechartsAppearanceOptions.axisNames.yaxisName;
		}

		dataseries.forEach(dataElement => {
			chartDescription.queriesInfo.push(
				new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit,
					this.figureCategoryType(dataElement, category)));
		});

		return chartObj;
	}

	createDynamicHighChartsChart(view: ViewFormSchema, category: CategoryFormSchema, dataseries: DataseriesFormSchema[], appearanceOptions: AppearanceFormSchema): HighChartsChart {

    const chartObj = new HighChartsChart();

		if (appearanceOptions.chartAppearance.generalOptions != null)
			chartObj.orderBy = appearanceOptions.chartAppearance.generalOptions.orderByAxis as string;

		// Is this a polar diagram ?
		chartObj.chartDescription.chart.polar = category.diagram.isPolar;

		if (appearanceOptions.chartAppearance.highchartsAppearanceOptions != null) {

			if (appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcMiscOptions != null) {
				// Exporting
				chartObj.chartDescription.exporting.enabled =
					appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcMiscOptions.exporting as boolean;

				// Stacked Chart
				chartObj.chartDescription.plotOptions.series.stacking =
					appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcMiscOptions.stackedChart == 'null' ?
						undefined : appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcMiscOptions.stackedChart;
			}

			// Legend Options
			chartObj.chartDescription.legend.enabled =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcLegend?.hcEnableLegend;
			chartObj.chartDescription.legend.align =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcLegend?.hcLegendHorizontalAlignment as "left" | "center" | "right";

			chartObj.chartDescription.legend.verticalAlign =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcLegend?.hcLegendVerticalAlignment as "bottom" | "top" | "middle";
			chartObj.chartDescription.legend.layout = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcLegend?.hcLegendLayout as "horizontal" | "vertical" | "proximate";

			// Tooltip Options
			if (chartObj.chartDescription.plotOptions.series.stacking === 'percent') {
				chartObj.chartDescription.tooltip.pointFormat = "<b>{point.percentage:.1f}%</b> ({point.y})";
			}


			// Credits Options
			chartObj.chartDescription.credits.enabled = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcCredits?.hcEnableCredits as boolean;
			chartObj.chartDescription.credits.text = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcCredits?.hcCreditsText as string;

			// Title Options
			if (appearanceOptions.chartAppearance.highchartsAppearanceOptions.title) {
				chartObj.chartDescription.title.text = appearanceOptions.chartAppearance.highchartsAppearanceOptions.title.titleText;
				chartObj.chartDescription.title.margin = appearanceOptions.chartAppearance.highchartsAppearanceOptions.title.margin;
				chartObj.chartDescription.title.align = appearanceOptions.chartAppearance.highchartsAppearanceOptions.title.align;
				if (chartObj.chartDescription.title.style !== undefined) {
					chartObj.chartDescription.title.style.color = appearanceOptions.chartAppearance.highchartsAppearanceOptions.title.color;
					chartObj.chartDescription.title.style.fontSize = appearanceOptions.chartAppearance.highchartsAppearanceOptions.title.fontSize?.toString() + "px";
				}
			}

			// Subtitle Options
			if (appearanceOptions.chartAppearance.highchartsAppearanceOptions.subtitle) {
				chartObj.chartDescription.subtitle.text = appearanceOptions.chartAppearance.highchartsAppearanceOptions.subtitle.subtitleText;
				chartObj.chartDescription.subtitle.align = appearanceOptions.chartAppearance.highchartsAppearanceOptions.subtitle.align;
				if (chartObj.chartDescription.subtitle.style !== undefined) {
					chartObj.chartDescription.subtitle.style.color = appearanceOptions.chartAppearance.highchartsAppearanceOptions.subtitle.color;
					chartObj.chartDescription.subtitle.style.fontSize = appearanceOptions.chartAppearance.highchartsAppearanceOptions.subtitle.fontSize?.toString() + "px";
				}
			}

			// Chart Data Labels
			chartObj.chartDescription.plotOptions.series.dataLabels.enabled =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcDataLabels?.enabled as boolean;

			if (chartObj.chartDescription.plotOptions.series.dataLabels.enabled) {
				chartObj.chartDescription.plotOptions.series.dataLabels.style.color =
					appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcDataLabels?.style?.color;
			}


			// Chart Area Options
			chartObj.chartDescription.chart.backgroundColor = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcChartArea?.hcCABackGroundColor;
			chartObj.chartDescription.chart.borderColor = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcChartArea?.hcCABorderColor;
			chartObj.chartDescription.chart.borderRadius = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcChartArea?.hcCABorderCornerRadius;
			chartObj.chartDescription.chart.borderWidth = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcChartArea?.hcCABorderWidth;

			// Plot Area Options

			chartObj.chartDescription.chart.plotBackgroundColor =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcPlotArea?.hcPABackgroundColor;

			chartObj.chartDescription.chart.plotBackgroundImage =
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcPlotArea?.hcPABackgroundImageURL;
			chartObj.chartDescription.chart.plotBorderColor = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcPlotArea?.hcPABorderColor;
			chartObj.chartDescription.chart.plotBorderWidth = appearanceOptions.chartAppearance.highchartsAppearanceOptions.hcPlotArea?.hcPABorderWidth;

			if (appearanceOptions.chartAppearance.highchartsAppearanceOptions.xAxis) {
				if (chartObj.chartDescription.xAxis.title !== undefined) {
					chartObj.chartDescription.xAxis.title.text = appearanceOptions.chartAppearance.highchartsAppearanceOptions.xAxis.xAxisText;
				}
				if (chartObj.chartDescription.xAxis.title !== undefined && chartObj.chartDescription.xAxis.title.style !== undefined) {
					chartObj.chartDescription.xAxis.title.style.color = appearanceOptions.chartAppearance.highchartsAppearanceOptions.xAxis.color;
					chartObj.chartDescription.xAxis.title.style.fontSize = appearanceOptions.chartAppearance.highchartsAppearanceOptions.xAxis.fontSize?.toString() + "px";
				}
			}

			if (appearanceOptions.chartAppearance.highchartsAppearanceOptions.yAxis) {
				if (chartObj.chartDescription.yAxis.title !== undefined) {
					chartObj.chartDescription.yAxis.title.text = appearanceOptions.chartAppearance.highchartsAppearanceOptions.yAxis.yAxisText;
				}
				if (chartObj.chartDescription.yAxis.title !== undefined && chartObj.chartDescription.yAxis.title.style !== undefined) {
					chartObj.chartDescription.yAxis.title.style.color = appearanceOptions.chartAppearance.highchartsAppearanceOptions.yAxis.color;
					chartObj.chartDescription.yAxis.title.style.fontSize = appearanceOptions.chartAppearance.highchartsAppearanceOptions.yAxis.fontSize?.toString() + "px";
				}
				chartObj.chartDescription.yAxis.reversedStacks = appearanceOptions.chartAppearance.highchartsAppearanceOptions.yAxis.reversedStacks;
			}
		}

		// Axis Zoom options

		chartObj.chartDescription.xAxis.zoomEnabled = appearanceOptions.chartAppearance.highchartsAppearanceOptions?.hcZoomOptions?.enableXaxisZoom;
		chartObj.chartDescription.yAxis.zoomEnabled = appearanceOptions.chartAppearance.highchartsAppearanceOptions?.hcZoomOptions?.enableYaxisZoom;

		// Set Color Theme. More universal approach
		if ((appearanceOptions.chartAppearance.highchartsAppearanceOptions !== undefined &&
			appearanceOptions.chartAppearance.highchartsAppearanceOptions.dataSeriesColorArray !== undefined &&
			appearanceOptions.chartAppearance.highchartsAppearanceOptions.dataSeriesColorArray.length > 1) ||
			(appearanceOptions.chartAppearance.highchartsAppearanceOptions !== undefined &&
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.dataSeriesColorArray !== undefined &&
				appearanceOptions.chartAppearance.highchartsAppearanceOptions.dataSeriesColorArray[0] !== '#00000000')) {
			chartObj.chartDescription.colors = appearanceOptions.chartAppearance.highchartsAppearanceOptions.dataSeriesColorArray.concat(this.hcColorTheme);
		}
		else
			chartObj.chartDescription.colors = this.hcColorTheme;

		const queries = new Array<ChartInfo>();
    const dataseriesColors: ColorType[] = [];

    dataseries.forEach(dataElement => {

      const chartInfo = new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit, this.figureCategoryType(dataElement, category));
      queries.push(chartInfo);

			// Make sure that Highcharts gets a valid stacking value
			chartObj.chartDescription.series.push({ stacking: dataElement.chartProperties.stacking == 'null' ? undefined : dataElement.chartProperties.stacking });

			// Push Dataseries colors to the color scheme
			if (dataElement.chartProperties.dataseriesColor != null)
				dataseriesColors.push(dataElement.chartProperties.dataseriesColor);
		});

		if (dataseriesColors.length > 0)
			chartObj.chartDescription.colors = dataseriesColors.concat(chartObj.chartDescription.colors);

		// TREEMAP ONLY : Set Color Gradient min and max color. Takes only the first of the colors array.
		// Trim the alpha values, if the color has alpha.
		// Hard coded logic bleehh
		if (category.diagram.type == "treemap") {
      const gradientMapMaxColor = this.ignoreAlphaColor(chartObj.chartDescription.colors[0] as string);

      chartObj.chartDescription.colorAxis = { minColor: '#FFFFFF', maxColor: gradientMapMaxColor };
		}

		chartObj.chartDescription.queries = queries;
		return chartObj;
	}

	private figureCategoryType(dataElement: DataseriesFormSchema, category: CategoryFormSchema): string {
		if (category.diagram.type === 'combo') {
			if (dataElement.chartProperties.chartType == null)
				return 'line';
			return dataElement.chartProperties.chartType;
		}

		return category.diagram.type;
	}

	createDynamicEChartsChart(view: ViewFormSchema, category: CategoryFormSchema, dataseries: DataseriesFormSchema[], appearanceOptions: AppearanceFormSchema): EChartsChart {

		const chartObj = new EChartsChart();

		if (appearanceOptions.chartAppearance.generalOptions !== undefined
			&& appearanceOptions.chartAppearance.generalOptions.orderByAxis !== null) {
			chartObj.orderBy = appearanceOptions.chartAppearance.generalOptions.orderByAxis as string;
		}

		// tslint:disable-next-line:max-line-length
		if (appearanceOptions.chartAppearance.echartsAppearanceOptions !== undefined && appearanceOptions.chartAppearance.echartsAppearanceOptions !== null) {
			// Exporting
			// tslint:disable-next-line:max-line-length
			chartObj.chartDescription.toolbox.show = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecMiscOptions?.exporting as boolean;
			if (chartObj.chartDescription.toolbox.show) {
				chartObj.chartDescription.toolbox.right = '10';
				chartObj.chartDescription.toolbox.feature = new ECToolboxFeature();
			}
			// Legend Options
			chartObj.chartDescription.legend.show = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecLegend?.ecEnableLegend as boolean;
			chartObj.chartDescription.legend.orient = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecLegend?.ecLegendLayout as "horizontal" | "vertical";
			// tslint:disable-next-line:max-line-length
			chartObj.chartDescription.legend.left = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecLegend?.ecLegendHorizontalAlignment as string | number;
			// tslint:disable-next-line:max-line-length
			chartObj.chartDescription.legend.top = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecLegend?.ecLegendVerticalAlignment as string | number;

			if (appearanceOptions.chartAppearance.echartsAppearanceOptions.titles) {
				if (chartObj.chartDescription.title !== undefined) {
					chartObj.chartDescription.title.text = appearanceOptions.chartAppearance.echartsAppearanceOptions.titles.title;
					chartObj.chartDescription.title.subtext = appearanceOptions.chartAppearance.echartsAppearanceOptions.titles.subtitle;
				}
			}

			// Chart Area Options
			// tslint:disable-next-line:max-line-length
			chartObj.chartDescription.backgroundColor = appearanceOptions.chartAppearance.echartsAppearanceOptions.ecChartArea?.ecCABackGroundColor;

			if (appearanceOptions.chartAppearance.echartsAppearanceOptions.axisNames) {
				if (chartObj.chartDescription.xAxis !== undefined) {
					chartObj.chartDescription.xAxis.name = appearanceOptions.chartAppearance.echartsAppearanceOptions.axisNames.xaxisName;
					if (chartObj.chartDescription.yAxis !== undefined) {
						chartObj.chartDescription.yAxis.name = appearanceOptions.chartAppearance.echartsAppearanceOptions.axisNames.yaxisName;
					}
				}
			}
		}

		// Axis Zoom options
		chartObj.chartDescription.dataZoom = [
			// Xaxis Zoom options
			{ show: appearanceOptions.chartAppearance.echartsAppearanceOptions?.ecZoomOptions?.enableXaxisZoom },
			// Yaxis Zoom options
			{ show: appearanceOptions.chartAppearance.echartsAppearanceOptions?.ecZoomOptions?.enableYaxisZoom, yAxisIndex: 0 }
		];

		// Set Color Theme. More universal approach
		if ((appearanceOptions.chartAppearance.echartsAppearanceOptions !== undefined &&
			appearanceOptions.chartAppearance.echartsAppearanceOptions.dataSeriesColorArray !== undefined &&
			appearanceOptions.chartAppearance.echartsAppearanceOptions.dataSeriesColorArray.length > 1) ||
			(appearanceOptions.chartAppearance.echartsAppearanceOptions !== undefined &&
				appearanceOptions.chartAppearance.echartsAppearanceOptions.dataSeriesColorArray !== undefined &&
				appearanceOptions.chartAppearance.echartsAppearanceOptions.dataSeriesColorArray[0] !== '#00000000')) {
			// tslint:disable-next-line:max-line-length
			chartObj.chartDescription.color = appearanceOptions.chartAppearance.echartsAppearanceOptions.dataSeriesColorArray.concat(this.ecColorTheme);
		}
		else
			chartObj.chartDescription.color = this.ecColorTheme;


		const queries = new Array<ChartInfo>();
    const dataseriesColors: string[] = [];

    dataseries.forEach(dataElement => {
			// Push queries to JSON for CDF
			queries.push(new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit,
				this.figureCategoryType(dataElement, category)));

			// Push Dataseries colors to the color scheme
			if (dataElement.chartProperties.dataseriesColor != null)
				dataseriesColors.push(dataElement.chartProperties.dataseriesColor);
		});

		if (dataseriesColors.length > 0)
			chartObj.chartDescription.color = dataseriesColors.concat(chartObj.chartDescription.color);

		chartObj.chartDescription.queries = queries;

		// Initialize the echarts series
		dataseries.forEach(dataElement => {
			chartObj.chartDescription.series.push({
				type: category.diagram.type === 'area' ? 'line' : category.diagram.type,
				areaStyle: category.diagram.type === 'area' ? {} : null,

				// Stack options
				// NOTE: To enable a stack chart in echarts, the stack property needs to be a truthy value.
				// Since the property type is (wrongly) just string a truthy value would be literally any string
				stack: appearanceOptions.chartAppearance.echartsAppearanceOptions?.ecMiscOptions?.stackedChart ? 'true' : null,
				// Label options
				label: {
					show: appearanceOptions.chartAppearance.echartsAppearanceOptions?.ecMiscOptions?.ecEnableDataLabels,
					position: this.figureLabelPosition(appearanceOptions.chartAppearance.echartsAppearanceOptions?.ecMiscOptions?.ecEnableDataLabels as boolean),
					formatter: (a: any) => a.value.toLocaleString()
				}
			} as {
				color?: Color | undefined;
				origin?: string | undefined;
				shadowBlur?: number | undefined;
				shadowColor?: Color | undefined;
				shadowOffsetX?: number | undefined;
				shadowOffsetY?: number | undefined;
				opacity?: number | undefined;
			});
		});

		// TREEMAP ONLY : Set Color Gradient min and max color. Takes only the first of the colors array.
		// Trim the alpha values, if the color has alpha.
		// NOTE: We support treemap with only one depth (one dataseries)
		if (category.diagram.type == "treemap") {
      const gradientMapMaxColor = this.ignoreAlphaColor(chartObj.chartDescription.color[0] as string);

      (chartObj.chartDescription.series[0] as EChartOption.SeriesTreemap).levels =
				[{ color: ['#F0F0F0', gradientMapMaxColor], colorMappingBy: 'value' }];

		}

		console.log('chartObj.chartDescription', chartObj.chartDescription);

		return chartObj;
	}
	figureLabelPosition(isStacked: boolean): 'inside' | 'right' { return isStacked ? 'inside' : 'right' }

	createDynamicHighMapsMap(view: ViewFormSchema, category: CategoryFormSchema, dataseries: DataseriesFormSchema[], appearanceOptions: AppearanceFormSchema): HighMapsMap {

		const mapObj = new HighMapsMap();
		mapObj.library = appearanceOptions.chartAppearance.generalOptions.visualisationLibrary;

		// tslint:disable-next-line:max-line-length
		if (appearanceOptions.chartAppearance.highmapsAppearanceOptions !== undefined && appearanceOptions.chartAppearance.highmapsAppearanceOptions !== null) {
			// Color Axis
			mapObj.mapDescription.colorAxis.max = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis?.hmColorAxisMax === undefined ?
				null as any : appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis.hmColorAxisMax;
			mapObj.mapDescription.colorAxis.min = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis?.hmColorAxisMin === undefined ?
				null as any : appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis.hmColorAxisMin;
			mapObj.mapDescription.colorAxis.maxColor = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis?.hmColorAxisMaxColor as string;
			mapObj.mapDescription.colorAxis.minColor = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis?.hmColorAxisMinColor as string;
			mapObj.mapDescription.colorAxis.type = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmColorAxis?.hmColorAxisType as string;
			// Exporting
			mapObj.mapDescription.exporting.enabled = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmMiscOptions?.exporting as boolean;
			// Title
			if (appearanceOptions.chartAppearance.highmapsAppearanceOptions.title != null) {
				mapObj.mapDescription.title.text = appearanceOptions.chartAppearance.highmapsAppearanceOptions.title.titleText;
				mapObj.mapDescription.title.align = appearanceOptions.chartAppearance.highmapsAppearanceOptions.title.align;
				mapObj.mapDescription.title.margin = appearanceOptions.chartAppearance.highmapsAppearanceOptions.title.margin;
				if (mapObj.mapDescription.title.style !== undefined) {
					mapObj.mapDescription.title.style.color = appearanceOptions.chartAppearance.highmapsAppearanceOptions.title.color;
					mapObj.mapDescription.title.style.fontSize = appearanceOptions.chartAppearance.highmapsAppearanceOptions.title.fontSize?.toString() + "px";
				}
			}
			// Subtitle
			if (appearanceOptions.chartAppearance.highmapsAppearanceOptions.subtitle != null) {
				mapObj.mapDescription.subtitle.text = appearanceOptions.chartAppearance.highmapsAppearanceOptions.subtitle.subtitleText;
				mapObj.mapDescription.subtitle.align = appearanceOptions.chartAppearance.highmapsAppearanceOptions.subtitle.align;
				if (mapObj.mapDescription.subtitle.style !== undefined) {
					mapObj.mapDescription.subtitle.style.color =
						appearanceOptions.chartAppearance.highmapsAppearanceOptions.subtitle.color;
					mapObj.mapDescription.subtitle.style.fontSize = appearanceOptions.chartAppearance.highmapsAppearanceOptions.subtitle.fontSize?.toString() + "px";
				}
			}
			// MapNavigation
			mapObj.mapDescription.mapNavigation.enabled = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmMiscOptions?.hmEnableMapNavigation as boolean;
			// Credits
			mapObj.mapDescription.credits.enabled = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmCredits?.hmEnableCredits as boolean;
			mapObj.mapDescription.credits.text = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmCredits?.hmCreditsText as string;
			// Legend
			mapObj.mapDescription.legend.enabled = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmLegend?.hmEnableLegend;
			//Country Zoom
			mapObj.mapDescription.zoomTo = appearanceOptions.chartAppearance.highmapsAppearanceOptions.hmZoomTo as { destination: string; zoomValue: number; };

		}

		dataseries.forEach(dataElement => {
			mapObj.mapDescription.series.push(
				// Dataseries Info
				new HMSeriesInfo(dataElement.chartProperties.dataseriesName as string,
					appearanceOptions.chartAppearance.highmapsAppearanceOptions?.hmMiscOptions?.hmEnableDataLabels as boolean)
			);
			mapObj.mapDescription.queries.push(
				new ChartInfo(dataElement, view.profile, appearanceOptions.chartAppearance.generalOptions.resultsLimit, category.diagram.type)
			);
		});

		mapObj.mapDescription.chart.map = this.diagramCategoryService
			.supportedMaps
			.find((map: ISupportedMap) => map.type === category.diagram.type)?.name as string;

		return mapObj;
	}

	private ignoreAlphaColor(color: string): string {
    let finalColor = null;
    if (color.length > 7)
			finalColor = color.slice(0, 7)

		return finalColor != null ? finalColor : color;
	}
}
