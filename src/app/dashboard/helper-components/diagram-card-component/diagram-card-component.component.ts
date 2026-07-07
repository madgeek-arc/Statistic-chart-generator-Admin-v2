import { Component, input, output } from '@angular/core';
import { ISupportedCategory } from "../../../services/supported-chart-types-service/supported-chart-types.service";

@Component({
  selector: 'app-diagram-card-component',
  templateUrl: './diagram-card-component.component.html',
  styleUrls: ['./diagram-card-component.component.less'],
})
export class DiagramCardComponentComponent {
  diagram = input.required<ISupportedCategory>();
  isSelected = input(false);
  outputEvent = output<ISupportedCategory>();

  categorySelect(): void {
    this.outputEvent.emit(this.diagram());
  }
}
