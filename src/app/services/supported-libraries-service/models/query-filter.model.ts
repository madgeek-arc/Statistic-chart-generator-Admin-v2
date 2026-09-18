export class Filter {

    field: string;
    type: string;
    values: string[];

    constructor() {
        this.field = '';
        this.type = '';
        this.values = [];
    }
}

export class FilterGroup {

    groupFilters: Filter[];
    op: string;

    constructor() {
        this.groupFilters = [];
        this.op = '';
    }
}

