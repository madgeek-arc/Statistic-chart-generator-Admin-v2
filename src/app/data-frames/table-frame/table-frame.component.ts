import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';
import { GoogleChartsTable } from "../../services/supported-libraries-service/models/chart-description-GoogleCharts.model";

@Component({
  selector: 'table-frame',
  templateUrl: './table-frame.component.html',
  styleUrls: ['./table-frame.component.scss']
})
export class TableFrameComponent implements OnInit, OnChanges {

  @ViewChild('tableIframe', {static:true}) iframe: ElementRef;
  @Input() table: GoogleChartsTable | null;
  frameUrl: SafeResourceUrl;

  frameHeight: number;

  constructor(private sanitizer: DomSanitizer, private urlProvider: UrlProviderService) {
    this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/table');
  }

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;

    const iframe = <HTMLIFrameElement>document.getElementById('tableIframe');
    if ( this.iframe.nativeElement ) {
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

    const stringObj = JSON.stringify(changes['table'].currentValue);
    console.log('[table-frame.component] On changes: ' + stringObj);

    if (changes['table'].currentValue) {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.createTableURL(changes['table'].currentValue));
      console.log(this.frameUrl);
    } else {
      this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/table');
    }
  }

  getSanitizedFrameUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
