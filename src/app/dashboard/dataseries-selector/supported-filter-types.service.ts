import { Injectable } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';

export enum FieldType { text, int, float, date }

export class FilterType {
	filterOperator: string;
	filterName: string;
	filterType: FieldType[];
}

@Injectable({
	providedIn: 'root'
})
export class SupportedFilterTypesService {

	constructor() { }

	getSupportedFilterTypes(): Observable<Array<FilterType>> {
		return observableOf(supportedFilterTypesArray);
	}
	getFiltersOfType(type: FieldType): Observable<Array<FilterType>> {
		return observableOf(supportedFilterTypesArray.filter(
			(element: FilterType) => element.filterType.includes(type)));
	}
}

const supportedFilterTypesArray = [
	{ filterOperator: '=', filterName: 'Equals', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: '!=', filterName: 'Not equals', filterType: [FieldType.text, FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: '>', filterName: 'Greater than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: '>=', filterName: 'Greater / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: '<', filterName: 'Less than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: '<=', filterName: 'Less / Equal than', filterType: [FieldType.int, FieldType.float, FieldType.date] },
	{ filterOperator: 'contains', filterName: 'Contains', filterType: [FieldType.text] },
	{ filterOperator: 'starts_with', filterName: 'Starts with', filterType: [FieldType.text] },
	{ filterOperator: 'ends_with', filterName: 'Ends with', filterType: [FieldType.text] }
];
