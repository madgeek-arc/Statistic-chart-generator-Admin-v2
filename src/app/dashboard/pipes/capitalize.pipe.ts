import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

	transform(value: string | undefined, ...args: unknown[]): string {
		if (value) {
			const splitString = value.split(' ').map((s: string) => {
				return `${s[0].toUpperCase()}${s.slice(1)}`;
			})

			return splitString.join(' ');
		} else {
			return value ? value : '-';
		}
	}

}