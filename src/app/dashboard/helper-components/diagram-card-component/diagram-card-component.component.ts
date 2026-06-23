import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISupportedCategory } from "../../../services/supported-chart-types-service/supported-chart-types.service";

@Component({
    selector: 'app-diagram-card-component',
    templateUrl: './diagram-card-component.component.html',
    styleUrls: ['./diagram-card-component.component.less'],
    standalone: false
})
export class DiagramCardComponentComponent {
  @Input() diagram: ISupportedCategory;
  @Input() isSelected = false;
  @Output() outputEvent = new EventEmitter<any>();

  categorySelect(): void {
    this.outputEvent.emit(this.diagram);
  }
}
