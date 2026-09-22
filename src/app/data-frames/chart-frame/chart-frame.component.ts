import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  input,
  signal
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';

@Component({
    selector: 'chart-frame',
    templateUrl: './chart-frame.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChartFrameComponent implements OnChanges, AfterViewInit, OnInit {
  private sanitizer = inject(DomSanitizer);
  private urlProvider = inject(UrlProviderService);

  readonly chartUrl = input<string | null>(null);
	frameHeight: number;
	// A signal: the URL is set from a timeout, and the component is OnPush.
	frameUrl = signal<SafeResourceUrl | null>(null);

	constructor() {
    this.frameHeight = (3 * window.outerHeight) / 5;
		this.frameUrl.set(this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart?json'));
	}

  ngOnInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;
  }

  ngAfterViewInit() {
    this.frameHeight = (3 * window.outerHeight) / 5;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartUrl'] && changes['chartUrl'].currentValue) {
      this.frameUrl.set(null);
      setTimeout(() => { // Ahh, the magic of setTimeout... even claude shat the bed on this one.
        this.frameUrl.set(this.getSanitizedFrameUrl(this.chartUrl()));
      }, 0);
    } else {
			this.frameUrl.set(this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart'));
		}
	}

	getSanitizedFrameUrl(url: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

}
