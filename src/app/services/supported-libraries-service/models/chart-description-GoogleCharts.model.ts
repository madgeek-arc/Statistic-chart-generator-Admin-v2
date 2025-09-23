import { ChartInfo } from "./chart-query.model";

export class GoogleChartsChart {
    library: string;
    orderBy: string;
    chartDescription: GoogleChartsDescription;

    constructor() {
        this.library = 'GoogleCharts';
        this.orderBy = 'xaxis';
        this.chartDescription = new GoogleChartsDescription();
    }
}

export class GoogleChartsTable {
    library: string;
    tableDescription: GoogleChartsDescription;

    constructor() {
        this.library = 'GoogleCharts';
        this.tableDescription = new GoogleChartsDescription();
    }
}

class GoogleChartsTableDescription {

    queriesInfo: ChartInfo[];
    columns: string[];
    options: GoogleChartsOptions;
    constructor() {
        this.queriesInfo = [];
        this.columns = new Array<string>();
        this.options = new GoogleChartsOptions();
    }
}

class GoogleChartsDescription {
    chartType: 'AreaChart'|'BarChart'|'ColumnChart'|'LineChart'|'PieChart'|'ComboChart'|'TreeMap' = 'ComboChart';
    columns: string[];
    queriesInfo: ChartInfo[];
    options: GoogleChartsOptions;

    constructor() {
        this.queriesInfo = [];
        this.columns = new Array<string>();
        this.options = new GoogleChartsOptions();
    }

    set GoogleChartType (type: string) {
        switch (type) {
            case 'area':
                this.chartType = 'AreaChart';
                break;
            case 'bar':
                this.chartType = 'BarChart';
                break;
            case 'column':
                this.chartType = 'ColumnChart';
                break;
            case 'line':
                this.chartType = 'LineChart';
                break;
            case 'pie':
                this.chartType = 'PieChart';
                break;
            case 'treemap':
                this.chartType = 'TreeMap';
                break;
            default :
                this.chartType = 'ComboChart';
                break;
        }
    }
}

class GoogleChartsOptions {
    title: string | undefined;
    backgroundColor: string | undefined;
    hAxis: GoogleChartsAxis;
    vAxis: GoogleChartsAxis;
    series: GoogleChartSeries [];
    chartArea: GoogleChartsChartArea;
    exporting: boolean;
    pageSize: number;
    isStacked: string;

    constructor() {
        this.hAxis = new GoogleChartsAxis();
        this.vAxis = new GoogleChartsAxis();
        this.chartArea = new GoogleChartsChartArea();
        this.series = [];
        this.exporting = false;
        this.pageSize = 50;
        this.isStacked = 'false';
    }
}

class GoogleChartsChartArea {
    backgroundColor: string | undefined;
}

class GoogleChartsAxis {
    title: string | undefined;
}

class GoogleChartSeries {
    type: 'area' | 'bars' | 'line' = 'line';

    setGoogleChartType(type: string) {
        switch (type) {
            case 'area':
                this.type = 'area';
                break;
            case 'bar':
                this.type = 'bars';
                break;
            case 'column':
                this.type = 'bars';
                break;
            case 'line':
                this.type = 'line';
                break;
            default :
                this.type = 'line';
                break;
        }
    }
}
