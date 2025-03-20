import { Pipe, PipeTransform } from '@angular/core';
import { FieldType } from '../dataseries-selector/dataseries-selector.component';

@Pipe({
	name: 'filterOperators'
})
export class FilterOperatorsPipe implements PipeTransform {

	transform(items: any[], filter: FieldType): any {

		// const fieldTypes: Array<string | FieldType> = Object.values(FieldType);
		// console.log("items:", items)
		// console.log("filter:", filter)
		// console.log("fieldTypes:", fieldTypes)
		if (!items || !filter) {
			return items;
		}
		return items.filter(item => item.filterType?.indexOf(FieldType[filter]) !== -1);
	}
}