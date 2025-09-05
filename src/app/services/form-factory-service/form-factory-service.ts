import { FormBuilder, Validators } from "@angular/forms";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class FormFactoryService {
  constructor(private fb: FormBuilder) {}

  createForm() {
    return this.fb.group({
      testingView: this.fb.control(null),
      view: this.createViewGroup(null),
      category: this.createCategoryGroup(),
      dataseries: this.createDataseriesGroup(),
      appearance: this.createAppearanceGroup()
    })
  }

  createViewGroup(profile: string | null) {
    return this.fb.group({
      profile: this.fb.control(profile)
    });
  }

  createCategoryGroup() {
    return this.fb.group({
      diagram: this.fb.group({
        type: this.fb.control<string | null>(null),
        supportedLibraries: this.fb.array([]),
        name: this.fb.control<string | null>(null),
        diagramId: this.fb.control<number | null>(null),
        description: this.fb.control<string | null>(null),
        imageURL: this.fb.control<string | null>(null),
        isPolar: this.fb.control<string | null>(null),
        isHidden: this.fb.control<string | null>(null)
      })
    });
  }

  createDataseriesGroup() {
    return this.fb.array([
      this.fb.group({
        data: this.fb.group({
          yaxisData: this.fb.group({
            entity: this.fb.control<string | null>(null, Validators.required),
            yaxisAggregate: this.fb.control<string | null>(null, Validators.required),
            yaxisEntityField: this.fb.group({
              name: this.fb.control<string | null>(null),
              type: this.fb.control<string | null>(null)
            }),
          }),
          xaxisData: this.fb.array([
            this.fb.group({
              xaxisEntityField: this.fb.group({
                name: this.fb.control<string | null>(null),
                type: this.fb.control<string | null>(null)
              })
            })
          ]),
          filters: this.fb.array([])
        }),
        chartProperties: this.fb.group({
          chartType: this.fb.control<string | null>(null),
          dataseriesColor: this.fb.control<string | null>(null),
          dataseriesName: this.fb.control<string | null>({ value: 'Data', disabled: true }),
          stacking: this.fb.control<null | 'normal' | 'percent' | 'stream' | 'overlap'>(null, Validators.required),
        }),
      })
    ]);
  }

  createAppearanceGroup() {
    return this.fb.group({
      chartAppearance: this.fb.group({
        generalOptions: this.fb.group({
          visualisationLibrary: this.fb.control('HighCharts', Validators.required),
          resultsLimit: this.fb.control(30, [Validators.required, Validators.min(1)]),
          orderByAxis: this.fb.control(null),
        }),
        visualisationOptions: this.fb.group({
          highchartsAppearanceOptions: this.fb.group({
            title: this.fb.group({
              titleText: this.fb.control<string>(''),
              color: this.fb.control<string>('#333333'),
              align: this.fb.control<'right' | 'center' | 'left'>('center'),
              margin: this.fb.control<number>(15),
              fontSize: this.fb.control<number>(18)
            }),
            subtitle: this.fb.group({
              text: this.fb.control(null),
              color: this.fb.control('#666666'),
              horizontalAlignment: this.fb.control('center'),
              fontSize: this.fb.control(12)
            }),
            xAxis: this.fb.group({
              name: this.fb.control(null),
              fontSize: this.fb.control(11),
              color: this.fb.control('#666666')
            }),
            yAxis: this.fb.group({
              name: this.fb.control(null),
              fontSize: this.fb.control(11),
              color: this.fb.control('#666666')
            }),
            miscOptions: this.fb.group({
              enableExporting: this.fb.control(true),
              enableDrilldown: this.fb.control(false),
              stackedGraph: this.fb.control('disabled'),
            }),
            chartArea: this.fb.group({
              backgroundColor: this.fb.control(null),
              borderColor: this.fb.control('#335cad'),
              borderCornerRadius: this.fb.control(0),
              borderWidth: this.fb.control(0)
            }),
            plotArea: this.fb.group({
              backgroundColor: this.fb.control('#ffffff'),
              borderColor: this.fb.control('#cccccc'),
              backgroundImageUrl: this.fb.control(''),
              borderWidth: this.fb.control(0)
            }),
            dataLabels: this.fb.group({
              enableData: this.fb.control(false)
            }),
            credits: this.fb.group({
              enableCredits: this.fb.control(false)
            }),
            legend: this.fb.group({
              enableLegend: this.fb.control(true),
              itemlayout: this.fb.control('horizontal'),
              horizontalAlignment: this.fb.control('center'),
              verticalAlignment: this.fb.control('bottom')
            }),
            zoomOptions: this.fb.group({
              enableXAxisZoom: this.fb.control(false),
              enableYAxisZoom: this.fb.control(false)
            }),
            dataSeriesColorPalette: this.fb.array([])
          }),
          googlechartsAppearanceOptions: this.fb.group({
            titles: this.fb.group({
              title: this.fb.control<string>(''),
              subtitle: this.fb.control<string>('')
            }),
            axisNames: this.fb.group({
              yaxisName: this.fb.control<string>(''),
              xaxisName: this.fb.control<string>('')
            }),
            exporting: this.fb.control<boolean>(true),
            stackedChart: this.fb.control<string>('disabled'),
            gcCABackGroundColor: this.fb.control<string>('#ffffff'),
            gcPABackgroundColor: this.fb.control<string>('#ffffff')
          }),
          echartsAppearanceOptions: this.fb.group({
            titles: this.fb.group({
              title: this.fb.control<string>(''),
              subtitle: this.fb.control<string>('')
            }),
            axisNames: this.fb.group({
              yaxisName: this.fb.control<string>(''),
              xaxisName: this.fb.control<string>('')
            }),
            dataSeriesColorArray: this.fb.array<string>([]),
            ecChartArea: this.fb.group({
              ecCABackGroundColor: this.fb.control<string>('#ffffff')
            }),
            ecLegend: this.fb.group({
              ecEnableLegend: this.fb.control<boolean>(true),
              ecLegendLayout: this.fb.control<'horizontal' | 'vertical'>('horizontal'),
              ecLegendHorizontalAlignment: this.fb.control<'left' | 'center' | 'right'>('center'),
              ecLegendVerticalAlignment: this.fb.control<'top' | 'middle' | 'bottom'>('bottom')
            }),
            ecMiscOptions: this.fb.group({
              exporting: this.fb.control<boolean>(true),
              ecEnableDataLabels: this.fb.control<boolean>(false),
              stackedChart: this.fb.control<boolean>(false)
            }),
            ecZoomOptions: this.fb.group({
              enableXaxisZoom: this.fb.control<boolean>(false),
              enableYaxisZoom: this.fb.control<boolean>(false)
            })
          })
        }),
      }),
      tableAppearance: this.fb.group({
        paginationSize: this.fb.control(30, [Validators.required, Validators.min(1)])
      }),
    });
  }

}
