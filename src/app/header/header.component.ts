import { Component } from '@angular/core';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { ChartLoadingService } from "../services/chart-loading-service/chart-loading.service";
import { UrlMappingService } from "../services/url-mapping-service/url-mapping-service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  urlJson: string | null = null;
  errorMsg: string | null = null;

  constructor(public dynamicFormHandlingService: DynamicFormHandlingService, private urlMappingService: UrlMappingService,
              public chartLoadingService: ChartLoadingService) {}

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

  loadFormFromUrl() {
    // console.log(this.urlJson);
    setTimeout(() => {
      this.errorMsg = null;
    }, 4000);

    if (this.urlJson === null){
      this.errorMsg = 'Missing URL';
      return;
    }

    const tmpData = this.urlJson.split('/chart?json=');
    if (tmpData.length !== 2){
      this.errorMsg = 'Invalid URL';
      return;
    }

    if (!this.isValidJson(decodeURIComponent(tmpData[1]))) {
      this.errorMsg = 'Invalid JSON';
      return;
    }

    console.log(decodeURIComponent(tmpData[1]));
    // Magic starts here
    this.urlMappingService.updateFormObjet(JSON.parse(decodeURIComponent(tmpData[1])));
  }

  isValidJson(str: string): boolean {
    try {
      const parsed = JSON.parse(str);
      // Optionally: check if the result is an object or array
      return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
      return false;
    }
  }
}
