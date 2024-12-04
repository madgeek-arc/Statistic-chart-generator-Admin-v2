import { Component } from '@angular/core';
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  constructor(public dynamicFormHandlingService: DynamicFormHandlingService) {}

  saveChart(): void {
    this.dynamicFormHandlingService.exportForm();
  }

}
