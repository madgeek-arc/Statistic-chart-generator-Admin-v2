import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';
import {
  RawChartDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model";

@Component({
  selector: 'raw-chart-data-frame',
  templateUrl: './raw-chart-data-frame.component.html',
})
export class RawChartDataFrameComponent implements OnInit, OnChanges {

  @ViewChild('rawChartDataIframe', {static: true}) iframe: ElementRef<HTMLIFrameElement>;
  @Input() rawChartData: RawChartDataModel | null;
  frameUrl: SafeResourceUrl;

  frameHeight: number;

  constructor(private sanitizer: DomSanitizer, private urlProvider: UrlProviderService) {
    this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart/json');
  }

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;

    // const iframe = <HTMLIFrameElement>document.getElementById('rawChartDataIframe');
    if (this.iframe.nativeElement) {
      window.addEventListener('message', (event: any) => {

        if (event.origin !== this.urlProvider.serviceURL &&
          event.origin !== this.urlProvider.iframeURL) {
          console.log('Untrusted message', event.origin);
          return;
        }

        // console.log('Table:', event);
        this.iframe.nativeElement.style.height = event.data + 'px';
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    const stringObj = JSON.stringify(changes['rawChartData'].currentValue);
    console.log('[raw-chart-data-frame.component] On changes: ' + stringObj);

    if (changes['rawChartData'].currentValue) {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.createRawChartDataUrl(changes['rawChartData'].currentValue));
      console.log(this.frameUrl);
    } else {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart/json');
    }
  }

  getSanitizedFrameUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
