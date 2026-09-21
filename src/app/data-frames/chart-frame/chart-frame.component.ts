import {
  AfterViewInit,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  input
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';

@Component({
    selector: 'chart-frame',
    templateUrl: './chart-frame.component.html'
})

export class ChartFrameComponent implements OnChanges, AfterViewInit, OnInit {
  private sanitizer = inject(DomSanitizer);
  private urlProvider = inject(UrlProviderService);

  readonly chartUrl = input<string | null>(null);
	frameHeight: number;
	frameUrl: SafeResourceUrl | null = null;

	constructor() {
    this.frameHeight = (3 * window.outerHeight) / 5;
		this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart?json');
		console.log("CHART URL:", this.frameUrl);
	}

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;
  }

  ngAfterViewInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;
  }

  ngOnChanges(changes: SimpleChanges) {
		console.log('[chart-frame.component] On changes: ' + changes['chartUrl']?.currentValue);

    if (changes['chartUrl'] && changes['chartUrl'].currentValue) {
      this.frameUrl = null;
      setTimeout(() => { // Ahh, the magic of setTimeout... even claude shat the bed on this one.
        this.frameUrl = this.getSanitizedFrameUrl(this.chartUrl());
      }, 0);
    } else {
			this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart');
		}
	}

	getSanitizedFrameUrl(url: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

}
