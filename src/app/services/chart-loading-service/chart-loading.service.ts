import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartLoadingService {

  private $chartIsLoading: BehaviorSubject<boolean>;

  private _hasLoadedAChart = false;

  constructor() {
    this.$chartIsLoading = new BehaviorSubject<boolean>(false);
  }

  set chartLoadingStatus(isLoading: boolean) {
    this.$chartIsLoading.next(isLoading);
    this._hasLoadedAChart = false;
    console.log('Chart Loading: ' + this.chartLoadingStatus);
  }

  get chartLoadingStatus(): boolean {
    return this.$chartIsLoading.value;
  }

  set isChartLoaded(value: boolean){
    this._hasLoadedAChart = value;
  }

  get isChartLoaded(): boolean{
    return this._hasLoadedAChart;
  }

}
