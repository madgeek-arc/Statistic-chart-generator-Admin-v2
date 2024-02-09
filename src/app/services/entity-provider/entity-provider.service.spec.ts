import { TestBed } from '@angular/core/testing';

import { EntityProviderService } from './entity-provider.service';

describe('EntityProviderService', () => {
	let service: EntityProviderService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EntityProviderService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
