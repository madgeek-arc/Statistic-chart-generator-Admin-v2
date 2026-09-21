import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { ISupportedCategory } from "../../services/supported-chart-types-service/supported-chart-types.service";
import { DiagramCategoryService } from "../../services/diagram-category-service/diagram-category.service";
import { AsyncPipe } from "@angular/common";
import {
  DiagramCardComponentComponent
} from "../helper-components/diagram-card-component/diagram-card-component.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    DiagramCardComponentComponent
  ]
})
export class CategorySelectorComponent {
  protected diagramCategoryService = inject(DiagramCategoryService);

  selectedChartChange = output<ISupportedCategory>();

  // A signal, so the view refreshes when the service reports a selection (OnPush).
  selectedChart = signal<ISupportedCategory | null>(null);

  constructor() {
    this.diagramCategoryService.selectedDiagramCategory$.pipe(takeUntilDestroyed()).subscribe(diagram => {
      this.selectChart(diagram);
    })
  }


  selectChart(chart: ISupportedCategory): void {
    this.selectedChart.set(chart);

    this.selectedChartChange.emit(chart);
  }

}
