import { Component, inject } from '@angular/core';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { ChartLoadingService } from "../services/chart-loading-service/chart-loading.service";
import { ChartExportingService } from "../services/chart-exporting-service/chart-exporting.service";
import { UrlMappingService } from "../services/url-mapping-service/url-mapping-service";
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, NgClass, SlicePipe } from '@angular/common';
import { GeneratedShortUrlFieldComponent } from '../data-frames/generated-short-url-field/generated-short-url-field.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
    imports: [RouterLink, NgOptimizedImage, NgClass, GeneratedShortUrlFieldComponent, ReactiveFormsModule, FormsModule, SlicePipe]
})
export class HeaderComponent {
  dynamicFormHandlingService = inject(DynamicFormHandlingService);
  private urlMappingService = inject(UrlMappingService);
  chartLoadingService = inject(ChartLoadingService);
  chartExportingService = inject(ChartExportingService);

  urlJson: string | null = null;
  errorMsg: string | null = null;

  saveChart(): void {
    this.dynamicFormHandlingService.exportForm();
  }

  loadChart(event: any): void {
    this.dynamicFormHandlingService.loadForm(event);
  }

  initiateFilePicker() {
    const fileElem = document.getElementById('fileElem');

    if (fileElem)
      fileElem.click();

  }

  clearSelection(): void {
    this.dynamicFormHandlingService.resetLoadForm();
  }

  share() {
    this.dynamicFormHandlingService.publishURLS();
  }

  loadFormFromUrl() {
    setTimeout(() => {
      this.errorMsg = null;
    }, 4000);

    if (this.urlJson === null || this.urlJson.trim() === '') {
      this.errorMsg = 'Missing URL';
      return;
    }

    const tmpData = this.urlJson.split('?json=');
    if (tmpData.length !== 2){
      this.errorMsg = 'Invalid URL';
      return;
    }

    if (!this.isValidJson(decodeURIComponent(tmpData[1]))) {
      this.errorMsg = 'Invalid JSON';
      return;
    }

    // Magic starts here
    const raw = tmpData[0].endsWith('/raw');
    console.log('Is raw data: ', raw);
    this.urlMappingService.updateFormObjet(JSON.parse(decodeURIComponent(tmpData[1])), raw);
  }

  isValidJson(str: string): boolean {
    try {
      const parsed = JSON.parse(str);
      // Optionally: check if the result is an object or array
      return typeof parsed === 'object' && parsed !== null;
    } catch (_e) {
      return false;
    }
  }

}
