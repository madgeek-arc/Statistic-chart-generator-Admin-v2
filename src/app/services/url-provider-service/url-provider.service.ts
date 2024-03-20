import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlProviderService {

  get iframeURL(): string {
    return  environment.apiUrl;
  }

  get serviceURL(): string {
    return environment.apiUrl + environment.apiFolder;
  }

  public createChartURL(chartObject: Object): string
  {
    var stringObj = JSON.stringify(chartObject);
    stringObj = stringObj.replaceAll('%', '%25');
    
    return this.serviceURL + '/chart?json=' + encodeURIComponent(stringObj);
  }

  public createTableURL(tableObject: Object): string
  {
    var stringObj = JSON.stringify(tableObject);
    stringObj = stringObj.replaceAll('%', '%25');

    return this.serviceURL + '/table?json=' + encodeURIComponent(stringObj);
  }

  public createRawChartDataUrl(rawChartDataObject: Object) : string
  {
    var stringObj = JSON.stringify(rawChartDataObject);
    stringObj = stringObj.replaceAll('%', '%25');

    return this.serviceURL + '/chart/json?json=' + encodeURIComponent(stringObj);
  }

  public createRawDataUrl(rawDataObject: Object): string
  {
    var stringObj = JSON.stringify(rawDataObject);
    stringObj = stringObj.replaceAll('%', '%25');

    return this.serviceURL + '/raw?json=' + encodeURIComponent(stringObj);
  }
}
