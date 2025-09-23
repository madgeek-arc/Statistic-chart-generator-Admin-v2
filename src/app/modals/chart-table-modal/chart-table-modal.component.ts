import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MaterialModule } from "../../material/material.module";
import { FrameModule } from "../../data-frames/frame.module";
import { HighChartsChart } from "../../services/supported-libraries-service/models/chart-description-HighCharts.model";
import {
  GoogleChartsChart,
  GoogleChartsTable
} from "../../services/supported-libraries-service/models/chart-description-GoogleCharts.model";
import { HighMapsMap } from "../../services/supported-libraries-service/models/chart-description-HighMaps.model";
import { EChartsChart } from "../../services/supported-libraries-service/models/chart-description-eCharts.model";
import { RawChartDataModel } from "../../services/supported-libraries-service/models/chart-description-rawChartData.model";
import { RawDataModel } from "../../services/supported-libraries-service/models/description-rawData.model";
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
  styleUrls: ['chart-table-modal.component.scss'],
  standalone: true,
  imports: [MaterialModule, FrameModule]
})

export class ChartTableModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChartTableModalContext,
              public chartExportingService: ChartExportingService) {
  }
}
