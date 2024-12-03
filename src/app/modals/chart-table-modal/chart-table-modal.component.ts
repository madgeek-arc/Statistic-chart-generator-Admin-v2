import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MaterialModule } from "../../material/material.module";
import { FrameModule } from "../../data-frames/frame.module";
import {
  HighChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighCharts.model";
import {
  GoogleChartsChart,
  GoogleChartsTable
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-GoogleCharts.model";
import {
  HighMapsMap
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-HighMaps.model";
import {
  EChartsChart
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-eCharts.model";
import {
  RawChartDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/chart-description-rawChartData.model";
import {
  RawDataModel
} from "../../dashboard/customise-appearance/visualisation-options/supported-libraries-service/description-rawData.model";
import { JsonPipe } from "@angular/common";
import { ChartExportingService } from "../../services/chart-exporting-service/chart-exporting.service";

export interface ChartTableModalContext {
  chartObj: HighChartsChart | GoogleChartsChart | HighMapsMap | EChartsChart | null;
  tableObj: GoogleChartsTable | null;
  rawChartDataObj: RawChartDataModel | null;
  rawDataObj: RawDataModel | null;
}

@Component({
  selector: 'chart-table-modal',
  templateUrl: 'chart-table-modal.component.html',
  standalone: true,
  imports: [MaterialModule, FrameModule]
})

export class ChartTableModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChartTableModalContext,
              public chartExportingService: ChartExportingService) {
  }
}
