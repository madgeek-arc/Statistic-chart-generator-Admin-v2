import { NgModule } from "@angular/core";
import { ChartFrameComponent } from "./chart-frame/chart-frame.component";
import { TableFrameComponent } from "./table-frame/table-frame.component";
import { RawChartDataFrameComponent } from "./raw-chart-data-frame/raw-chart-data-frame-component";
import { RawDataFrameComponent } from "./raw-data-frame/raw-data-frame.component";
import { GeneratedShortUrlFieldComponent } from "./generated-short-url-field/generated-short-url-field.component";
import { CommonModule } from "@angular/common";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		ChartFrameComponent,
		TableFrameComponent,
		RawChartDataFrameComponent,
		RawDataFrameComponent,
		GeneratedShortUrlFieldComponent,
	],
	exports: [
		ChartFrameComponent,
		TableFrameComponent,
		RawChartDataFrameComponent,
		RawDataFrameComponent,
		GeneratedShortUrlFieldComponent,
	]
})

export class FrameModule { }
