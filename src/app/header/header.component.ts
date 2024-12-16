import { Component } from '@angular/core';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { ChartLoadingService } from "../services/chart-loading-service/chart-loading.service";
import UIkit from "uikit";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  chartUrl: string | null = null;
  emptyInput = false;
  invalidUrl = false;
  warnTimeoutId: ReturnType<typeof setTimeout> | null = null;
  dangerTimeoutId: ReturnType<typeof setTimeout> | null = null;
  jsonFromUrl: JSON | null = null;

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

  clearSelection(): void {
    this.dynamicFormHandlingService.resetLoadForm();
    this.chartUrl = null;
  }

  //   URL handling
  parseUrl() {
    if (this.chartUrl === null || this.chartUrl === '') {
      this.handleWarningModal();
      return;
    }

    if (!this.chartUrl.includes('/chart?json=')) {
      this.handleDangerModal();
      return;
    }
    // console.log(this.chartUrl.split('/chart?json=')[1]);
    console.log(decodeURIComponent(this.chartUrl.split('/chart?json=')[1]));
    this.jsonFromUrl = this.tryParseJSONObject(decodeURIComponent(this.chartUrl.split('/chart?json=')[1]));
    console.log(this.jsonFromUrl);


  }

  tryParseJSONObject (jsonString: string){
    try {
      let o = JSON.parse(jsonString);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === "object") {
        return o;
      }
    }
    catch (e) {
      this.handleDangerModal();
      return;

    }

    return false;
  }

  //Other
  handleDangerModal(): void {
    this.invalidUrl = true

    if (this.dangerTimeoutId)
      return;

    this.dangerTimeoutId = setTimeout(() => {
      UIkit.alert('#alertDanger')?.close();

      setTimeout(() => {
        this.invalidUrl = false;
        this.dangerTimeoutId = null;
      }, 200);

    }, 3500);
  }

  handleWarningModal(): void {
    this.emptyInput = true;

    if (this.warnTimeoutId)
      return;

    this.warnTimeoutId = setTimeout(() => {
      UIkit.alert('#alertWarning')?.close();

      setTimeout(() => {
        this.emptyInput = false;
        this.warnTimeoutId = null;
      }, 200);

    }, 3500);
  }

}
