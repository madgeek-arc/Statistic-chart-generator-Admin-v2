import { DataFormSchema } from "../chart-form-schema.classes";
import { Query } from "./chart-query.model";

export class RawDataModel {
    orderBy: string | null = null;
    verbose = false;
    series: QueryInfo[] = [];

    constructor() {}
}

export class QueryInfo {
    query: Query;

    constructor(dataseriesData: DataFormSchema, profile: string, limit: string) {
        this.query = new Query(dataseriesData, profile, limit);
    }
}
