import * as Highcharts from "highcharts";
import { ChartInfo } from "../chart-query.model";

export class HighChartsChart {
	library: string;
	orderBy: string;
	chartDescription: HighChartsDescription;

	constructor() {
		this.library = 'HighCharts';
		this.orderBy = 'xaxis';
		this.chartDescription = new HighChartsDescription();
	}
}

class HighChartsDescription {
	chart: Highcharts.ChartOptions
	title: Highcharts.TitleOptions;
	subtitle: Highcharts.SubtitleOptions;
	yAxis: Highcharts.YAxisOptions;
	xAxis: Highcharts.XAxisOptions;
	queries: Array<ChartInfo> = [];
	lang: HCLang;
	exporting: HCExporting;
	plotOptions: HCPlotOptions;
	tooltip: Highcharts.TooltipOptions;
	legend: HCLegend;
	credits: HCCredits;
	colors: Highcharts.ColorType[] = [];
	colorAxis: { minColor: Highcharts.ColorType, maxColor: Highcharts.ColorType };
	series: Array<{ stacking?: undefined | 'normal' | 'percent' | 'stream' | 'overlap' }> = [];

	constructor() {
		this.chart = {
			type: 'line',
			polar: false,
			backgroundColor: '#ffffff',
			borderColor: '#335cad',
			borderRadius: 0,
			borderWidth: 0,
			plotBorderColor: '#cccccc',
			plotBorderWidth: 0,
			zoomType: 'xy'
		}
		this.title = { style: {} } as Highcharts.TitleOptions;
		this.subtitle = { style: {} } as Highcharts.SubtitleOptions;
		this.yAxis = {
			title: { style: {} },
			zoomEnabled: false
		} as Highcharts.YAxisOptions;
		this.xAxis = {
			title: { style: {} },
			zoomEnabled: false
		} as Highcharts.XAxisOptions;
		this.lang = new HCLang();
		this.exporting = new HCExporting();
		this.plotOptions = new HCPlotOptions();
		this.legend = new HCLegend();
		this.credits = new HCCredits();
		this.tooltip = { style: {} } as Highcharts.TooltipOptions;
	}
}

class HCchart {
	/* In TypeScript this option has no effect in sense of typing and instead the type option must always be set in the series. 
	 https://api.highcharts.com/highcharts/chart.type */
	type: string = 'line';
	polar: boolean = false;

	backgroundColor: string = '#ffffff';
	borderColor: string = '#335cad';
	borderRadius: number = 0;
	borderWidth: number = 0;

	plotBackgroundImage: string | undefined;
	plotBackgroundColor: string | undefined;
	plotBorderColor: string = '#cccccc';
	plotBorderWidth: number = 0;
}
export class HCsubtitle {
	text: string | undefined;
}
export class HCtitle {
	text: string | undefined;
}
class HCaxis {
	title: HCtitle;

	constructor() {
		this.title = new HCtitle();
	}
}
class HCLang {
	noData = 'No Data available for the Query';
}

export class HCExporting {
	enabled: boolean;
	constructor() {
		this.enabled = false;
	}
}

export class HCLegend {
	enabled: boolean | undefined;
	layout: 'horizontal' | 'vertical' | 'proximate' = 'horizontal';
	align: 'left' | 'center' | 'right' = 'center';
	verticalAlign: 'bottom' | 'top' | 'middle' = 'bottom';
}

class HCPlotOptions {
	series: HCPlotOptionsSeries;
	constructor() {
		this.series = new HCPlotOptionsSeries();
	}
}

class HCPlotOptionsSeries {
	dataLabels: HCDataLabels;
	stacking: undefined | 'normal' | 'percent' | 'stream' | 'overlap';
	constructor() {
		this.dataLabels = new HCDataLabels();
		this.stacking = undefined;
	}
}

export class HCDataLabels implements Highcharts.DataLabelsOptions {
	enabled: boolean = false;
	format: string | undefined = undefined;
	style: Highcharts.CSSObject =
		{
			'textOutline': '2px contrast',
			'stroke-width': 0
		};
}

export class HCZoomOptionsFormSchema {
	enableXaxisZoom?: boolean;
	enableYaxisZoom?: boolean;
}

export class HCCredits {
	enabled: boolean = true;
	text: string | null = null;
	href: string | null = null;
}
