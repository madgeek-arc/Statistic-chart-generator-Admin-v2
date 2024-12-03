import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';
import {
  HighChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model";
import {
  GoogleChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model";
import {
  HighMapsMap
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model";
import {
  EChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model";

@Component({
  selector: 'chart-frame',
  templateUrl: './chart-frame.component.html',
  styleUrls: ['./chart-frame.component.scss']
})
export class ChartFrameComponent implements OnInit, OnChanges {

  @ViewChild('chartFrame', {static: false})
  private chartFrameRef: ElementRef;

  @Input() chart: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null;
  frameHeight: number;
  frameWidth: number;
  frameUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer, private urlProvider: UrlProviderService) {
    this.frameUrl = this.getSanitizedFrameUrl(urlProvider.serviceURL + '/chart');
    console.log(this.frameUrl);
  }

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;
  }

  ngOnChanges(changes: SimpleChanges) {
    const stringObj = JSON.stringify(changes['chart'].currentValue);
    console.log('[chart-frame.component] On changes: ' + stringObj);

    if (changes['chart'].currentValue) {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.createChartURL(changes['chart'].currentValue));
      console.log(this.frameUrl);
    } else {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart');
    }
  }

  getSanitizedFrameUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
