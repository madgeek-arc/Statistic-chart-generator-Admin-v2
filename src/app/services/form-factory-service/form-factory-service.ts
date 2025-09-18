import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DestroyRef, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({ providedIn: 'root' })

export class FormFactoryService {
  private destroyRef = inject(DestroyRef);

  private formRoot: FormGroup;

  constructor(private fb: FormBuilder) {}

  //////////////////////
  // Helpers
  //////////////////////
  private unwrapValue(node: any) {
    // If the node is of shape { value: ..., disabled: ... } return .value
    // Otherwise return the node itself (primitive or object)
    if (node !== null && node !== undefined && typeof node === 'object' && 'value' in node) {
      return node.value;
    }
    return node;
  }

  private isDisabled(node: any): boolean {
    // If a node is of shape { disabled: true }, we honor it, otherwise false
    return !!(node && typeof node === 'object' && node.disabled === true);
  }

  private controlFromRaw<T = any>(rawNode: any, fallback: T = null, validators: Validators | null = null): FormControl<T> {
    const value = this.unwrapValue(rawNode);
    const disabled = this.isDisabled(rawNode);
    const ctrl = this.fb.control<T>( value ?? fallback, validators);
    if (disabled)
      ctrl.disable();
    return ctrl;
  }

  /**
   * Optional: serialize a control tree to { value, disabled } shape
   * Use this if you want to duplicate while preserving the disabled state.
   */
  serializeControl(control: AbstractControl): any {
    if (control instanceof FormControl) {
      return { value: control.value, disabled: control.disabled };
    }

    if (control instanceof FormGroup) {
      const obj: any = {};
      Object.keys(control.controls).forEach(k => {
        obj[k] = this.serializeControl(control.controls[k]);
      });
      return obj;
    }

    if (control instanceof FormArray) {
      return control.controls.map(c => this.serializeControl(c));
    }

    return null;
  }

  getFormRoot(): FormGroup {
    return this.formRoot;
  }

  createForm() {
    this.formRoot = this.fb.group({
      testingView: this.fb.control(null),
      view: this.createViewGroup(null),
      category: this.createCategoryGroup(),
      dataseries: this.createDataseriesGroupArray(),
      appearance: this.createAppearanceGroup()
    });

    return this.formRoot;
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

  createDataseriesGroup(index: number, rawValue?: any): FormGroup {
    const rv = rawValue ?? {};

    // console.log('createDataseriesGroup called with index=', index);
    // console.log('rv.data.xaxisData =', rv?.data?.xaxisData);
    // // for each element show its shape:
    // (rv?.data?.xaxisData ?? []).forEach((x: any, i: number) =>
    //   console.log(`xaxis[${i}] =`, JSON.stringify(x), 'type:', typeof x, x)
    // );


    // xaxisData: keep default one entry if none provided
    const xaxisRaw = rv?.data?.xaxisData ?? [];
    const xaxisControls = (xaxisRaw.length > 0 ? xaxisRaw : [ {} ]).map((x: any) => this.createXaxisEntityField(x)
    );

    // filters: map existing or default to an empty array
    const filtersRaw = rv?.data?.filters ?? [];
    const filtersControls = filtersRaw.map((f: any) => this.createFilterGroup(f));

    return this.fb.group({
      data: this.fb.group({
        yaxisData: this.fb.group({
          entity: this.controlFromRaw<string | null>(rv?.data?.yaxisData?.entity, null, Validators.required),
          yaxisAggregate: this.controlFromRaw<string | null>(rv?.data?.yaxisData?.yaxisAggregate, null, Validators.required),
          yaxisEntityField: this.fb.group({
            name: this.controlFromRaw<string | null>(rv?.data?.yaxisData?.yaxisEntityField?.name, null),
            type: this.controlFromRaw<string | null>(rv?.data?.yaxisData?.yaxisEntityField?.type, null)
          }),
        }),
        xaxisData: this.fb.array(xaxisControls),
        filters: this.fb.array(filtersControls)
      }),
      chartProperties: this.fb.group({
        chartType: this.controlFromRaw<string | null>(rv?.chartProperties?.chartType, null),
        dataseriesColor: this.controlFromRaw<string | null>(rv?.chartProperties?.dataseriesColor, null),
        dataseriesName: this.controlFromRaw<string>(rv?.chartProperties?.dataseriesName, 'Data' + (index > 0 ? `(${index})` : '')),
        stacking: this.controlFromRaw<'null' | 'normal' | 'percent' | 'stream' | 'overlap'>(rv?.chartProperties?.stacking ?? 'null', 'null', Validators.required)
      })
    });
  }

  createXaxisEntityField(rawValue?: any): FormGroup {
    const rv = rawValue ?? {};
    const node = rv?.xaxisEntityField ?? rv;

    const group = this.fb.group({
      xaxisEntityField: this.fb.group({
        name: this.controlFromRaw<string | null>(node?.name, null, Validators.required),
        type: this.controlFromRaw<string | null>(node?.type, null),
      })
    });

    return group;
  }

  createFilterGroup(rawValue?: any): FormGroup {
    const rv = rawValue ?? {};
    const groupFiltersRaw = rv?.groupFilters ?? [];
    const groupFiltersControls = groupFiltersRaw.map((gf: any) => this.createFilterRuleGroup(gf));

    return this.fb.group({
      groupFilters: this.fb.array(groupFiltersControls),
      op: this.controlFromRaw<'AND' | 'OR'>(rv?.op ?? 'AND')
    });
  }

  createFilterRuleGroup(rawValue?: any): FormGroup {
    const rv = rawValue ?? {};

    // values: if none provided create one control with null (keeps previous skeleton behavior)
    const valuesRaw = (rv?.values && rv.values.length > 0) ? rv.values : [ null ];
    const valuesControls = valuesRaw.map((v: any) => this.controlFromRaw(v, null));

    const group = this.fb.group({
      field: this.fb.group({
        name: this.controlFromRaw<string | null>(rv?.field?.name, null),
        type: this.controlFromRaw<string | null>(rv?.field?.type, null)
      }),
      // keep previous behavior: by default, 'type' was disabled in your original factory
      type: this.controlFromRaw<string | null>(rv?.type ?? { value: null, disabled: true }),
      values: this.fb.array(valuesControls)
    });

    group.get('field.type').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        if (value !== null && value !== undefined) {
          group.get('type').enable();
        }
      }
    });

    return group;
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
