import { Component, inject, output } from '@angular/core';
import { ISupportedCategory } from "../../services/supported-chart-types-service/supported-chart-types.service";
import { DiagramCategoryService } from "../../services/diagram-category-service/diagram-category.service";
import { AsyncPipe } from "@angular/common";
import {
  DiagramCardComponentComponent
} from "../helper-components/diagram-card-component/diagram-card-component.component";

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.less'],
  imports: [
    AsyncPipe,
    DiagramCardComponentComponent
  ]
})
export class CategorySelectorComponent {
  protected diagramCategoryService = inject(DiagramCategoryService);

  selectedChartChange = output<ISupportedCategory>();

  selectedChart: ISupportedCategory | null = null;

  selectChart(chart: ISupportedCategory): void {
    this.selectedChart = chart;

    this.selectedChartChange.emit(chart);
  }

}
