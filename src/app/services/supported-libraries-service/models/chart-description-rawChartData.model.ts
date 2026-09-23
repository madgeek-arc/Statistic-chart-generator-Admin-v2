import { DataseriesInfo } from "./chart-query.model";

export class RawChartDataModel {
    library: string;
    orderBy: string | null = null;
    chartsInfo: DataseriesInfo[] = [];

    constructor(library: string) {
        this.library = library;
    }
}
