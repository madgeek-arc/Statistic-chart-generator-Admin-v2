import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ChartExportingService } from './services/chart-exporting-service/chart-exporting.service';
import { CountriesListingService } from './services/countries-listing-service/countries-listing.service';
import { DbSchemaService } from './services/db-schema-service/db-schema.service';
import { DynamicFormHandlingService } from './services/dynamic-form-handling-service/dynamic-form-handling.service';
import { DynamicTreeDatabase } from './services/dynamic-tree-database/dynamic-tree-database.service';
import { FieldAutocompleteService } from './services/field-autocomplete-service/field-autocomplete.service';
import { MappingProfilesService } from './services/mapping-profiles-service/mapping-profiles.service';
import { SupportedChartTypesService } from './services/supported-chart-types-service/supported-chart-types.service';
import { UrlMappingService } from './services/url-mapping-service/url-mapping-service';
import { AutocompleteInputFieldComponent } from './dashboard/helper-components/autocomplete-input-field/autocomplete-input-field.component';
import { ChartFrameComponent } from './data-frames/chart-frame/chart-frame.component';
import { CustomiseAppearanceComponent } from './dashboard/customise-appearance/customise-appearance.component';
import { DataseriesSelectorComponent } from './dashboard/dataseries-selector/dataseries-selector.component';
import { HeaderComponent } from './header/header.component';
import { InputComponent } from './shared/input.component';
import { SelectAttributeComponent } from './dashboard/helper-components/select-attribute/select-attribute.component';

// Injection problems (a missing provider, or a field initializer that reads a service
// before it is injected) only surface when Angular constructs the class, not at compile
// time. These specs make the injector construct the classes moved to inject().
describe('Dependency injection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      // The components are only constructed, never initialized, so skip ngOnDestroy
      // (AutocompleteInputFieldComponent unsubscribes something created in ngAfterViewInit).
      teardown: { destroyAfterEach: false }
    });
  });

  const services: Type<unknown>[] = [
    ChartExportingService,
    CountriesListingService,
    DbSchemaService,
    DynamicFormHandlingService,
    DynamicTreeDatabase,
    FieldAutocompleteService,
    MappingProfilesService,
    SupportedChartTypesService,
    UrlMappingService
  ];
  services.forEach(service => {
    it(`resolves ${service.name}`, () => {
      expect(TestBed.inject(service)).toBeTruthy();
    });
  });

  const components: Type<unknown>[] = [
    AutocompleteInputFieldComponent,
    ChartFrameComponent,
    CustomiseAppearanceComponent,
    DataseriesSelectorComponent,
    HeaderComponent,
    InputComponent,
    SelectAttributeComponent
  ];
  components.forEach(component => {
    it(`constructs ${component.name}`, () => {
      expect(TestBed.createComponent(component).componentInstance).toBeTruthy();
    });
  });
});
