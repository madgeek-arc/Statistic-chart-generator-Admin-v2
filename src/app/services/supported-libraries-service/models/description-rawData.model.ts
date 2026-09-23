import { DataFormSchema } from "../chart-form-schema.classes";
import { Query } from "./chart-query.model";
import type { ChartInfo as NlChartInfo } from "../../nl-chat-service/nl-chat.service";

export class RawDataModel {
    orderBy: string | null = null;
    verbose = false;
    // Built from the form, or taken as-is from a completed NL chat session.
    series: (QueryInfo | NlChartInfo)[] = [];

    constructor() {}
}

export class QueryInfo {
    query: Query;

    constructor(dataseriesData: DataFormSchema, profile: string, limit: string) {
        this.query = new Query(dataseriesData, profile, limit);
    }
}
