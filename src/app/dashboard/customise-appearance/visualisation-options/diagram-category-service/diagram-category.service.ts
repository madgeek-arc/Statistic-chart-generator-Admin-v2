import { ISupportedPolar } from '../supported-chart-types-service/supported-chart-types.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    SupportedChartTypesService,
    ISupportedMap,
    ISupportedSpecialChartType,
    ISupportedChart,
    ISupportedCategory,
    ISupportedMiscType
} from '../supported-chart-types-service/supported-chart-types.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiagramCategoryService {

  public selectedDiagramCategory$: BehaviorSubject<ISupportedCategory>;

  supportedChartTypes: Array<ISupportedChart> = [];
  supportedPolarTypes: Array<ISupportedPolar> = [];
  supportedMaps: Array<ISupportedMap> = [];
  supportedSpecialisedDiagrams: Array<ISupportedSpecialChartType> = [];
  supportedMiscTypes: Array<ISupportedMiscType> = [];

  availableDiagrams: Array<ISupportedCategory> = [];

  hideChartFilter = (chart: ISupportedChart)=> !chart.isHidden;

  constructor(private chartTypesService: SupportedChartTypesService) {

    this.chartTypesService.getSupportedChartTypes().pipe(first()).subscribe(
      (data: Array<ISupportedChart>) => this.supportedChartTypes = data.filter(this.hideChartFilter), // success path
      error => {}, // error path
      () => {
        this.supportedChartTypes
        .map((elem: ISupportedChart) => this.availableDiagrams.push(elem));
      }
    );
    this.chartTypesService.getSupportedPolarTypes().pipe(first()).subscribe(
      (data: Array<ISupportedPolar>) => this.supportedPolarTypes = data.filter(this.hideChartFilter), // success path
      error => {}, // error path
      () => {
        this.supportedPolarTypes
        .map((elem: ISupportedPolar) => this.availableDiagrams.push(elem));
      }
    );
    this.chartTypesService.getSupportedMaps().subscribe(
      (data: Array<ISupportedMap>) => this.supportedMaps = data.filter(this.hideChartFilter), // success path
      error => {}, // error path
      () => {
        this.supportedMaps
        .map((elem: ISupportedMap) => this.availableDiagrams.push(elem));
      }
    );
    this.chartTypesService.getSupportedSpecialChartTypes().subscribe(
      (data: Array<ISupportedSpecialChartType>) => this.supportedSpecialisedDiagrams = data.filter(this.hideChartFilter), // success path
      error => {}, // error path
      () => {
        this.supportedSpecialisedDiagrams
        .map((elem: ISupportedSpecialChartType) => this.availableDiagrams.push(elem) );
      }
    );
    this.chartTypesService.getSupportedMiscTypes().subscribe(
        (data: Array<ISupportedMiscType>) => this.supportedMiscTypes = data.filter(this.hideChartFilter), // success path
          error => {}, // error path
          () => {
              this.supportedMiscTypes
              .map((elem: ISupportedMiscType) => this.availableDiagrams.push(elem) );
        }
    );

    this.selectedDiagramCategory$ = new BehaviorSubject(null as any);
  }

  public changeDiagramCategory(diagramCategory: ISupportedCategory) {

    const found = this.availableDiagrams.find(
        (availableDiagram: ISupportedCategory) => availableDiagram.type === diagramCategory.type);

      this.selectedDiagramCategory$.next((found === null || found === undefined) ? null as any : found);

      if (found) {
        console.log('Changed to:', diagramCategory.type);
      } else {
        console.log(diagramCategory.type + 'diagram not found among:', this.availableDiagrams );
      }
  }
}
