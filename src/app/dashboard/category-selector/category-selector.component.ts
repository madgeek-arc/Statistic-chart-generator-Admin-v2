import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { first } from 'rxjs';
import {
  ISupportedCategory,
  ISupportedChart,
  ISupportedMap,
  ISupportedMiscType,
  ISupportedPolar,
  ISupportedSpecialChartType,
  SupportedChartTypesService
} from "../../services/supported-chart-types-service/supported-chart-types.service";
import { FormFactoryService } from "../../services/form-factory-service/form-factory-service";
import { DiagramCategoryService } from "../../services/diagram-category-service/diagram-category.service";

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.less'],
  standalone: false
})
export class CategorySelectorComponent implements OnInit {
  private formFactoryService = inject(FormFactoryService);
  private diagramCategoryService = inject(DiagramCategoryService);

  @Input('categoryForm') categoryForm: FormGroup;
  @Output() showCategorySelection = new EventEmitter<any>();
  @Output() selectedChartChange = new EventEmitter<ISupportedCategory | null>();

  supportedChartTypes: ISupportedChart[] = [];
  supportedPolarTypes: ISupportedPolar[] = [];
  supportedMaps: ISupportedMap[] = [];
  supportedSpecialisedDiagrams: ISupportedSpecialChartType[] = [];
  supportedMiscTypes: ISupportedMiscType[] = [];

  selectedChart: ISupportedCategory | null = null;

  private hideHidden = (c: ISupportedCategory) => !c.isHidden;

  constructor(private chartProvider: SupportedChartTypesService) {}

  ngOnInit(): void {
    this.chartProvider.getSupportedChartTypes().pipe(first()).subscribe({
      next: (data) => this.supportedChartTypes = data.filter(this.hideHidden),
      error: (e) => console.error(e)
    });
    this.chartProvider.getSupportedPolarTypes().pipe(first()).subscribe({
      next: (data) => this.supportedPolarTypes = data.filter(this.hideHidden),
      error: (e) => console.error(e)
    });
    this.chartProvider.getSupportedMaps().pipe(first()).subscribe({
      next: (data) => this.supportedMaps = data.filter(this.hideHidden),
      error: (e) => console.error(e)
    });
    this.chartProvider.getSupportedSpecialChartTypes().pipe(first()).subscribe({
      next: (data) => this.supportedSpecialisedDiagrams = data.filter(this.hideHidden),
      error: (e) => console.error(e)
    });
    this.chartProvider.getSupportedMiscTypes().pipe(first()).subscribe({
      next: (data) => this.supportedMiscTypes = data.filter(this.hideHidden),
      error: (e) => console.error(e)
    });
  }

  selectChart(chart: ISupportedCategory): void {
    this.selectedChart = chart;

    (this.categoryForm.get('diagram.supportedLibraries') as FormArray)?.clear();
    for (let i = 0; i < chart.supportedLibraries.length; i++) {
      (this.categoryForm.get('diagram.supportedLibraries') as FormArray)?.push(new FormControl<string | null>(null));
    }
    this.categoryForm.get('diagram')?.patchValue(chart);
    this.diagramCategoryService.changeDiagramCategory(chart);

    if (chart.name !== 'combo') {
      (this.formFactoryService.getFormRoot().get('dataseries') as FormArray).controls.forEach((control: any) => {
        control.get('chartProperties.chartType').setValue(null);
      });
    }

    this.selectedChartChange.emit(chart);
  }

  continueToData(): void {
    if (!this.selectedChart) return;
    this.showCategorySelection.emit({ name: this.selectedChart.name, step: 'category' });
  }

  back(): void {
    this.showCategorySelection.emit({ step: 'view' });
  }
}
