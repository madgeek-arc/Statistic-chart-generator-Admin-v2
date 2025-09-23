import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';
import { RawDataModel } from "../../services/supported-libraries-service/models/description-rawData.model";

@Component({
  selector: 'raw-data-frame',
  templateUrl: './raw-data-frame.component.html',
})
export class RawDataFrameComponent implements OnInit, OnChanges {

  @ViewChild('rawDataIframe', {static: true}) iframe: ElementRef;
  @Input() rawData: RawDataModel | null;
  frameUrl: SafeResourceUrl;

  frameHeight: number;

  constructor(private sanitizer: DomSanitizer, private urlProvider: UrlProviderService) {
    this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/raw/json');
  }

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;

    // const iframe = <HTMLIFrameElement>document.getElementById('rawDataIframe');
    if (this.iframe.nativeElement) {
      window.addEventListener('message',
        (event: any) => {

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

    const stringObj = JSON.stringify(changes['rawData'].currentValue);
    console.log('[raw-data-frame.component] On changes: ' + stringObj);

    if (changes['rawData'].currentValue) {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.createRawDataUrl(changes['rawData'].currentValue));
      console.log(this.frameUrl);
    } else {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/raw?json');
    }
  }

  getSanitizedFrameUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
