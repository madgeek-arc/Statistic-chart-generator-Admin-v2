import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class FormFactoryService {
  constructor(private fb: FormBuilder) {}

  createForm() {
    return this.fb.group({
      testingView: this.fb.control(null),
      view: this.createViewGroup(null),
      category: this.createCategoryGroup(),
      dataseries: this.createDataseriesGroupArray(),
      appearance: this.createAppearanceGroup()
    });
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

  createDataseriesGroupArray() {
    return this.fb.array([
      this.createDataseriesGroup(0)
    ]);
  }

  createDataseriesGroup(index: number): FormGroup {
    return this.fb.group({
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
        dataseriesName: this.fb.control<string>('Data' + (index > 0 ? '(' + index + ')' : '')),
        stacking: this.fb.control<'null' | 'normal' | 'percent' | 'stream' | 'overlap'>('null', Validators.required),
      }),
    })
  }

  createAppearanceGroup() {
    const group = this.fb.group({
      chartAppearance: this.fb.group({
        generalOptions: this.fb.group({
          visualisationLibrary: this.fb.control('HighCharts', Validators.required),
          resultsLimit: this.fb.control(30, [Validators.required, Validators.min(1)]),
          orderByAxis: this.fb.control(null),
        }),
        // visualisationOptions: this.fb.group({
        highchartsAppearanceOptions: this.fb.group({
          title: this.fb.group({
            titleText: this.fb.control<string>(''),
            color: this.fb.control<string>('#333333'),
            align: this.fb.control<'left' | 'center' | 'right'>('center'),
            margin: this.fb.control<number>(15),
            fontSize: this.fb.control<number>(18)
          }),
          subtitle: this.fb.group({
            subtitleText: this.fb.control<string | null>(null),
            color: this.fb.control<string>('#666666'),
            align: this.fb.control<'left' | 'center' | 'right'>('center'),
            fontSize: this.fb.control<number>(12)
          }),
          xAxis: this.fb.group({
            xAxisText: this.fb.control<string | null>(null),
            fontSize: this.fb.control<number>(11),
            color: this.fb.control<string>('#666666')
          }),
          yAxis: this.fb.group({
            yAxisText: this.fb.control<string | null>(null),
            fontSize: this.fb.control<number>(11),
            color: this.fb.control<string>('#666666')
          }),
          hcMiscOptions: this.fb.group({
            exporting: this.fb.control<boolean>(true),
            drilldown: this.fb.control<boolean>(false),
            stackedChart: this.fb.control('disabled')
          }),
          hcChartArea: this.fb.group({
            hcCABackGroundColor: this.fb.control<string | null>(null),
            hcCABorderColor: this.fb.control<string>('#335cad'),
            hcCABorderCornerRadius: this.fb.control<number>(0),
            hcCABorderWidth: this.fb.control<number>(0)
          }),
          hcPlotArea: this.fb.group({
            hcPABackgroundColor: this.fb.control<string>('#ffffff'),
            hcPABorderColor: this.fb.control<string>('#cccccc'),
            hcPABackgroundImageURL: this.fb.control<string | null>(null),
            hcPABorderWidth: this.fb.control<number>(0)
          }),
          hcDataLabels: this.fb.group({
            enabled: this.fb.control<boolean>(false),
            format: this.fb.control<string | undefined>(undefined),
            style: this.fb.group({
              color: this.fb.control<string>('#333333'),
              textOutline: this.fb.control<string>('2px contrast'),
              'stroke-width': this.fb.control<number>(0)
            })
          }),
          hcCredits: this.fb.group({
            hcEnableCredits: this.fb.control<boolean>(false),
            hcCreditsText: this.fb.control<string>('Created by OpenAIRE via HighCharts')
          }),
          hcLegend: this.fb.group({
            hcEnableLegend: this.fb.control<boolean>(true),
            hcLegendLayout: this.fb.control<'horizontal' | 'vertical'>('horizontal'),
            hcLegendHorizontalAlignment: this.fb.control<'left' | 'center' | 'right'>('center'),
            hcLegendVerticalAlignment: this.fb.control<'bottom' | 'top' | 'middle'>('bottom')
          }),
          hcZoomOptions: this.fb.group({
            enableXaxisZoom: this.fb.control<boolean>(false),
            enableYaxisZoom: this.fb.control<boolean>(false)
          }),
          dataSeriesColorArray: this.fb.array<string>([])
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
        // }),
      }),
      tableAppearance: this.fb.group({
        paginationSize: this.fb.control<number>(30, [Validators.required, Validators.min(1)])
      }),
    });

    group.get('chartAppearance.googlechartsAppearanceOptions')?.disable();
    group.get('chartAppearance.echartsAppearanceOptions')?.disable();

    return group;
  }

}
