import { ChartInfo } from "./chart-query.model";

export class RawChartDataModel {
    library: string;
    orderBy: string | null = null;
    chartsInfo: ChartInfo[] = [];

    constructor(library: string) {
        this.library = library;
    }
}
