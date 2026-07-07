import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, of } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  ISupportedCategory,
  ISupportedChart,
  ISupportedMap,
  ISupportedMiscType,
  ISupportedPolar,
  ISupportedSpecialChartType,
  SupportedChartTypesService
} from '../supported-chart-types-service/supported-chart-types.service';

@Injectable({
  providedIn: 'root'
})
export class DiagramCategoryService {
  private chartTypesService = inject(SupportedChartTypesService);

  private readonly supportedChartTypesSubject = new BehaviorSubject<ISupportedChart[]>([]);
  public readonly supportedChartTypes$ = this.supportedChartTypesSubject.asObservable();

  private readonly supportedPolarTypesSubject = new BehaviorSubject<ISupportedPolar[]>([]);
  public readonly supportedPolarTypes$ = this.supportedPolarTypesSubject.asObservable();

  private readonly supportedMapsSubject = new BehaviorSubject<ISupportedMap[]>([]);
  public readonly supportedMaps$ = this.supportedMapsSubject.asObservable();

  private readonly supportedSpecialisedDiagramsSubject = new BehaviorSubject<ISupportedSpecialChartType[]>([]);
  public readonly supportedSpecialisedDiagrams$ = this.supportedSpecialisedDiagramsSubject.asObservable();

  private readonly supportedMiscTypesSubject = new BehaviorSubject<ISupportedMiscType[]>([]);
  public readonly supportedMiscTypes$ = this.supportedMiscTypesSubject.asObservable();

  private readonly availableDiagramsSubject = new BehaviorSubject<ISupportedCategory[]>([]);
  public readonly availableDiagrams$ = this.availableDiagramsSubject.asObservable();

  private readonly selectedDiagramCategorySubject = new BehaviorSubject<ISupportedCategory | null>(null);
  public readonly selectedDiagramCategory$ = this.selectedDiagramCategorySubject.asObservable();

  constructor() {
    this.loadSupportedDiagrams();
  }

  private loadSupportedDiagrams(): void {
    forkJoin({
      charts: this.chartTypesService.getSupportedChartTypes().pipe(take(1), catchError(() => of([] as ISupportedChart[]))),
      polars: this.chartTypesService.getSupportedPolarTypes().pipe(take(1), catchError(() => of([] as ISupportedPolar[]))),
      maps: this.chartTypesService.getSupportedMaps().pipe(take(1), catchError(() => of([] as ISupportedMap[]))),
      special: this.chartTypesService.getSupportedSpecialChartTypes().pipe(take(1), catchError(() => of([] as ISupportedSpecialChartType[]))),
      misc: this.chartTypesService.getSupportedMiscTypes().pipe(take(1), catchError(() => of([] as ISupportedMiscType[])))
    }).subscribe({
      next: ({charts, polars, maps, special, misc}) => {
        const visibleCharts = this.filterHidden(charts);
        const visiblePolars = this.filterHidden(polars);
        const visibleMaps = this.filterHidden(maps);
        const visibleSpecial = this.filterHidden(special);
        const visibleMisc = this.filterHidden(misc);

        this.supportedChartTypesSubject.next(visibleCharts);
        this.supportedPolarTypesSubject.next(visiblePolars);
        this.supportedMapsSubject.next(visibleMaps);
        this.supportedSpecialisedDiagramsSubject.next(visibleSpecial);
        this.supportedMiscTypesSubject.next(visibleMisc);

        this.availableDiagramsSubject.next([
          ...visibleCharts,
          ...visiblePolars,
          ...visibleMaps,
          ...visibleSpecial,
          ...visibleMisc
        ]);
      },
      error: err => {
        console.error('Failed to load supported diagram types:', err);
        this.availableDiagramsSubject.next([]);
      }
    });
  }

  private filterHidden<T extends { isHidden?: boolean }>(items: T[]): T[] {
    return items.filter(item => !item.isHidden);
  }

  public changeDiagramCategory(diagramCategory: ISupportedCategory): void {
    const found = this.availableDiagramsSubject.value.find(
      (availableDiagram: ISupportedCategory) => availableDiagram.diagramId === diagramCategory.diagramId
    );

    this.selectedDiagramCategorySubject.next(found ?? null);

    if (found) {
      console.log('Changed to:', diagramCategory.type);
    } else {
      console.log(`${diagramCategory.type} diagram not found among:`, this.availableDiagramsSubject.value);
    }
  }

  public get selectedDiagramCategory(): ISupportedCategory | null {
    return this.selectedDiagramCategorySubject.value;
  }

  public get availableDiagrams(): ISupportedCategory[] {
    return this.availableDiagramsSubject.value;
  }

  public get supportedChartTypes(): ISupportedChart[] {
    return this.supportedChartTypesSubject.value;
  }

  public get supportedPolarTypes(): ISupportedPolar[] {
    return this.supportedPolarTypesSubject.value;
  }

  public get supportedMaps(): ISupportedMap[] {
    return this.supportedMapsSubject.value;
  }

  public get supportedSpecialisedDiagrams(): ISupportedSpecialChartType[] {
    return this.supportedSpecialisedDiagramsSubject.value;
  }

  public get supportedMiscTypes(): ISupportedMiscType[] {
    return this.supportedMiscTypesSubject.value;
  }
}
