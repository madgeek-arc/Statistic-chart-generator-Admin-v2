import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlProviderService } from '../../services/url-provider-service/url-provider.service';
import { HighChartsChart } from "../../services/supported-libraries-service/models/chart-description-HighCharts.model";
import { GoogleChartsChart } from "../../services/supported-libraries-service/models/chart-description-GoogleCharts.model";
import { HighMapsMap } from "../../services/supported-libraries-service/models/chart-description-HighMaps.model";
import { EChartsChart } from "../../services/supported-libraries-service/models/chart-description-eCharts.model";

@Component({
    selector: 'chart-frame',
    templateUrl: './chart-frame.component.html',
    styleUrls: ['./chart-frame.component.scss'],
    standalone: false
})

export class ChartFrameComponent implements OnChanges {

	@ViewChild('chartFrame', { static: false })
	private chartFrameRef: ElementRef;

	@Input() chart: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null;
  @Input() chartUrl: string | null = null;
	frameHeight: number;
	frameWidth: number;
	frameUrl: SafeResourceUrl | null = null;

	constructor(private sanitizer: DomSanitizer, private urlProvider: UrlProviderService) {

    this.frameHeight = (3 * window.outerHeight) / 5;
		this.frameUrl = this.getSanitizedFrameUrl(urlProvider.serviceURL + '/chart');
		console.log("CHART URL:", this.frameUrl);
	}

	ngOnChanges(changes: SimpleChanges) {
		console.log('[chart-frame.component] On changes: ' + changes['chartUrl']?.currentValue);

    if (changes['chartUrl'] && changes['chartUrl'].currentValue) {
      // Force iframe reload by destroying and recreating
      this.frameUrl = null;
      setTimeout(() => {
        this.frameUrl = this.getSanitizedFrameUrl(this.chartUrl);
      }, 0);
			console.log(this.frameUrl);
		} else {
			this.frameUrl = this.getSanitizedFrameUrl(this.urlProvider.serviceURL + '/chart');
		}
	}

	getSanitizedFrameUrl(url: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

}
