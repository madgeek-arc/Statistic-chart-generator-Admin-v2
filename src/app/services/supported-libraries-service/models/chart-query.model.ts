import { Filter, FilterGroup } from './query-filter.model';
import { DataseriesFormSchema, DataFormSchema } from "../chart-form-schema.classes";

export class Query {

    name: string;
    parameters: Array<any> = [];

    limit: string;
    profile: string;
    entity: string;
    select: Array<Select> = [];
    filters: Array<FilterGroup> = [];

    constructor(dataseriesData: DataFormSchema, profile: string, limit: string) {
        this.entity = dataseriesData.yaxisData.entity;
        this.profile = profile;
        this.limit = limit;

        const yaxisSelect = new Select();

        if (dataseriesData.yaxisData.yaxisAggregate === 'total') {
            yaxisSelect.aggregate = 'count';
            yaxisSelect.field = this.entity;
        } else {
            yaxisSelect.aggregate = dataseriesData.yaxisData.yaxisAggregate;
            yaxisSelect.field = dataseriesData.yaxisData.yaxisEntityField?.name as string;
        }
        this.select.push(yaxisSelect);

        dataseriesData.xaxisData.forEach(element => {
            const xaxisSelect = new Select();
            xaxisSelect.field = element.xaxisEntityField.name;
            this.select.push(xaxisSelect);
        });

        dataseriesData.filters.forEach(element => {
            const filterGroup = new FilterGroup();
            filterGroup.op = element.op;

            element.groupFilters.forEach(groupFilter => {
                const filter = new Filter();
                filter.field = groupFilter.field.name;
                filter.type = groupFilter.type;
                filter.values = groupFilter.values;
                filterGroup.groupFilters.push(filter);
            });
            this.filters.push(filterGroup);
        });
    }
}

export class Select {
    field: string;
    aggregate: string | null;

    constructor() {
        this.field = '';
        this.aggregate = null;
    }
}

export class ChartInfo {
    name: string;
    type: string;
    color: string;
    query: Query;

    constructor(dataseriesElement: DataseriesFormSchema, profile: string, limit: number, category: string) {
        this.name = dataseriesElement.chartProperties.dataseriesName as string;
        if (dataseriesElement.chartProperties.chartType) {
            this.type = dataseriesElement.chartProperties.chartType;
        } else {
            this.type = category;
        }
        this.color = dataseriesElement.chartProperties.dataseriesColor as string;
        this.query = new Query(dataseriesElement.data, profile, limit.toString());
    }
}
