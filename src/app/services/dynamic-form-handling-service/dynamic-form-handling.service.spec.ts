import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import { DynamicFormHandlingService } from './dynamic-form-handling.service';
import { DiagramCreator } from './dynamic-form-handling-diagram-creator';
import { FormFactoryService } from '../form-factory-service/form-factory-service';
import { DiagramCategoryService } from '../diagram-category-service/diagram-category.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { SCGAFormSchema } from '../supported-libraries-service/chart-form-schema.classes';
import { HighChartsChart } from '../supported-libraries-service/models/chart-description-HighCharts.model';
import { GoogleChartsTable } from '../supported-libraries-service/models/chart-description-GoogleCharts.model';
import { RawChartDataModel } from '../supported-libraries-service/models/chart-description-rawChartData.model';
import { RawDataModel } from '../supported-libraries-service/models/description-rawData.model';

// Drops every validator, children first, so each group re-validates on top of valid children.
// Same helper as header.component.spec.ts's "puts Share in the tab order" spec.
function clearValidators(control: AbstractControl): void {
  if (control instanceof FormGroup || control instanceof FormArray) {
    Object.values(control.controls).forEach(clearValidators);
  }
  control.clearValidators();
  control.updateValueAndValidity({ onlySelf: control.parent !== null });
}

describe('DynamicFormHandlingService', () => {
  let service: DynamicFormHandlingService;
  let httpMock: HttpTestingController;
  let urlProvider: UrlProviderService;
  let formFactory: FormFactoryService;
  let selectedDiagramCategory: { type: string } | null;

  beforeEach(() => {
    selectedDiagramCategory = { type: 'column' };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        {
          provide: DiagramCategoryService,
          useValue: { get selectedDiagramCategory() { return selectedDiagramCategory; } }
        }
      ]
    });
    formFactory = TestBed.inject(FormFactoryService);
    formFactory.createForm();
    service = TestBed.inject(DynamicFormHandlingService);
    httpMock = TestBed.inject(HttpTestingController);
    urlProvider = TestBed.inject(UrlProviderService);
  });

  afterEach(() => httpMock.verify());

  const shortenUrl = () => urlProvider.serviceURL + '/chart/shorten';
  const makeFormValid = () => clearValidators(formFactory.getFormRoot());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('publishes all four representations once the form is valid and a chart is built', () => {
    spyOn(DiagramCreator.prototype, 'createChart').and.returnValue(of({} as HighChartsChart));
    spyOn(DiagramCreator.prototype, 'createTable').and.returnValue(of({} as GoogleChartsTable));
    spyOn(DiagramCreator.prototype, 'createRawChartData').and.returnValue(of({} as RawChartDataModel));
    spyOn(DiagramCreator.prototype, 'createRawData').and.returnValue(of({} as RawDataModel));

    makeFormValid();
    service.formSchemaObject = {} as SCGAFormSchema;
    service.publishURLS();

    const requests = httpMock.match(shortenUrl());
    expect(requests.length).toBe(4);
    requests.forEach(req => {
      expect(req.request.method).toBe('POST');
      req.flush({ shortUrl: 'https://tinyurl.com/abc123' });
    });
  });

  it('does nothing when the form is invalid', () => {
    const createChart = spyOn(DiagramCreator.prototype, 'createChart').and.returnValue(of({} as HighChartsChart));

    service.formSchemaObject = {} as SCGAFormSchema;
    service.publishURLS();

    expect(createChart).not.toHaveBeenCalled();
    httpMock.expectNone(shortenUrl());
  });

  it('shortens only the raw data representation for a Numbers chart', () => {
    selectedDiagramCategory = { type: 'numbers' };
    const createChart = spyOn(DiagramCreator.prototype, 'createChart').and.returnValue(of({} as HighChartsChart));
    spyOn(DiagramCreator.prototype, 'createRawData').and.returnValue(of({} as RawDataModel));

    makeFormValid();
    service.formSchemaObject = {} as SCGAFormSchema;
    service.publishURLS();

    expect(createChart).not.toHaveBeenCalled();
    const requests = httpMock.match(shortenUrl());
    expect(requests.length).toBe(1);
    requests[0].flush({ shortUrl: 'https://tinyurl.com/abc123' });
  });
});
