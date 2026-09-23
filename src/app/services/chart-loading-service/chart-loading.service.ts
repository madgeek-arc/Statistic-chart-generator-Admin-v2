import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartLoadingService {

  // Signals, so OnPush components that read these getters in a template refresh when they change.
  private readonly _chartIsLoading = signal(false);

  private readonly _hasLoadedAChart = signal(false);

  set chartLoadingStatus(isLoading: boolean) {
    this._chartIsLoading.set(isLoading);
    this._hasLoadedAChart.set(false);
  }

  get chartLoadingStatus(): boolean {
    return this._chartIsLoading();
  }

  set isChartLoaded(value: boolean){
    this._hasLoadedAChart.set(value);
  }

  get isChartLoaded(): boolean{
    return this._hasLoadedAChart();
  }

}
