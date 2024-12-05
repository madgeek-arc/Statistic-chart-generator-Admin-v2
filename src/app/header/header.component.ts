import { Component } from '@angular/core';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { ChartLoadingService } from "../services/chart-loading-service/chart-loading.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  constructor(public dynamicFormHandlingService: DynamicFormHandlingService,
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

}
