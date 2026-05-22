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
    standalone: false
})
export class CategorySelectorComponent implements OnInit {
  private formFactoryService = inject(FormFactoryService);
  private diagramCategoryService = inject(DiagramCategoryService);

	@Input('categoryForm') categoryForm: FormGroup;
	@Output() showCategorySelection = new EventEmitter<any>;

	supportedChartTypes: Array<ISupportedChart> = [];
	supportedPolarTypes: Array<ISupportedPolar> = [];
	supportedMaps: Array<ISupportedMap> = [];
	supportedSpecialisedDiagrams: Array<ISupportedSpecialChartType> = [];
	supportedMiscTypes: Array<ISupportedMiscType> = [];

	availableDiagrams: Array<ISupportedCategory> = [];

	hideChartFilter = (chart: ISupportedChart) => !chart.isHidden;


	constructor(
		private chartProvider: SupportedChartTypesService
	) { }

	ngOnInit(): void {
		this.chartProvider.getSupportedChartTypes().pipe(first()).subscribe({
			next: (data: Array<ISupportedChart>) => {
				this.supportedChartTypes = data.filter(this.hideChartFilter);
			},
			error: (err) => {
				console.log("ERROR getSupportedChartTypes:", err);
			},
			complete: () => {
				this.supportedChartTypes.map((elem: ISupportedChart) => {
					this.availableDiagrams.push(elem);
				});
			}
		});

		this.chartProvider.getSupportedPolarTypes().pipe(first()).subscribe(
			(data: Array<ISupportedPolar>) => {
				this.supportedPolarTypes = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedPolarTypes.map((elem: ISupportedPolar) => {
					this.availableDiagrams.push(elem);
				});
			}
		);


		this.chartProvider.getSupportedMaps().pipe(first()).subscribe(
			(data: Array<ISupportedMap>) => {
				this.supportedMaps = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedMaps.map((elem: ISupportedMap) => {
					this.availableDiagrams.push(elem);
				});
			}
		);

		this.chartProvider.getSupportedSpecialChartTypes().pipe(first()).subscribe(
			(data: Array<ISupportedSpecialChartType>) => {
				this.supportedSpecialisedDiagrams = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedSpecialisedDiagrams.map((elem: ISupportedSpecialChartType) => {
					this.availableDiagrams.push(elem);
				});
			}
		);


		this.chartProvider.getSupportedMiscTypes().pipe(first()).subscribe(
			(data: Array<ISupportedMiscType>) => {
				this.supportedMiscTypes = data.filter(this.hideChartFilter);
			},
			error => {
				console.log("ERROR getSupportedPolarTypes:", error);
			},
			() => {
				this.supportedMiscTypes.map((elem: ISupportedMiscType) => {
					this.availableDiagrams.push(elem);
				});
			}
		);


	}

	moveToNextStep(event: ISupportedCategory): void {
		if (event.name) {
			// console.log("moveToNextStep EVENT:", event);

			(this.categoryForm.get('diagram.supportedLibraries') as FormArray)?.clear();

			for (let i = 0; i < event.supportedLibraries.length; i++) {
				(this.categoryForm.get('diagram.supportedLibraries') as FormArray)?.push(new FormControl<string | null>(null));
			}
			this.categoryForm.get('diagram')?.patchValue(event);
      this.diagramCategoryService.changeDiagramCategory(event);

      // Reset the chartType of all dataseries to null. So chart type change can take place.
      // The above issue occurs when loading a chart from url.
      if (event.name != 'combo') {
        (this.formFactoryService.getFormRoot().get('dataseries') as FormArray).controls.forEach((control: FormGroup) => {
          control.get('chartProperties.chartType').setValue(null);
        });
      }

			this.showCategorySelection.emit({
				name: event.name,
				step: "category"
			});

		} else {
			this.showCategorySelection.emit({
				name: "PlaceHolder Category",
				step: "category"
			})
		}
	}

}

