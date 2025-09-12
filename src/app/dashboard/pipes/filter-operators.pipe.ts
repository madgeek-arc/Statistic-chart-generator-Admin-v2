import { Pipe, PipeTransform } from '@angular/core';
import { FieldType } from '../dataseries-selector/dataseries-selector.component';
import { Option } from "../../shared/input.component";

export interface FilterType {
  filterOperator: string;
  filterName: string;
  filterType: FieldType[];
}

@Pipe({
	name: 'filterOperators'
})
export class FilterOperatorsPipe implements PipeTransform {

	transform(items: FilterType[], filter: string): Option[] {

		// console.log("items:", items)
		// console.log("filter:", filter)
		if (!items || !filter) {
			return items.map(item => this.mapFilterToOption(item));
		}

    return items.filter(item => item.filterType?.indexOf(FieldType[filter]) !== -1).map(item => this.mapFilterToOption(item));
	}

  mapFilterToOption(filter: FilterType): Option {
    return {
      value: filter.filterOperator,    // used for selection
      label: filter.filterName,        // user-facing label
    };
  }
}
