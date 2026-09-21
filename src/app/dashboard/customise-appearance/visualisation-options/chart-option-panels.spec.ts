import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GoogleChartsComponent } from './google-charts/google-charts.component';
import { HighChartsComponent } from './high-charts/high-charts.component';
import { EChartsComponent } from './e-charts/e-charts.component';
import { HighMapsComponent } from './high-maps/high-maps.component';
import { DynamicFormHandlingService } from '../../../services/dynamic-form-handling-service/dynamic-form-handling.service';
import { FormFactoryService } from '../../../services/form-factory-service/form-factory-service';

// The panels take their FormGroup by reference and display it. The form changes without any event
// inside the panel: either programmatically, or (when a saved chart loads) with `emitEvent: false`
// followed by DynamicFormHandlingService.updateFromFile = false. Each panel has to refresh itself.

interface Host { form: FormGroup }

@Component({ template: `<app-google-charts [googleChartsForm]="form"></app-google-charts>`, imports: [GoogleChartsComponent] })
class GoogleChartsHostComponent implements Host { form!: FormGroup; }

@Component({ template: `<app-high-charts [highChartsForm]="form"></app-high-charts>`, imports: [HighChartsComponent] })
class HighChartsHostComponent implements Host { form!: FormGroup; }

@Component({ template: `<app-e-charts [eChartsForm]="form"></app-e-charts>`, imports: [EChartsComponent] })
class EChartsHostComponent implements Host { form!: FormGroup; }

@Component({ template: `<app-high-maps [highMapsForm]="form"></app-high-maps>`, imports: [HighMapsComponent] })
class HighMapsHostComponent implements Host { form!: FormGroup; }

interface Case {
  panel: string;
  host: Type<Host>;
  group: string;
  select: string;   // placeholder of the select that shows the control
  control: string;
  before: string;   // label shown for the default value
  value: string;
  after: string;    // label expected once the control is set programmatically
}

const cases: Case[] = [
  { panel: 'GoogleChartsComponent', host: GoogleChartsHostComponent, group: 'googlechartsAppearanceOptions',
    select: 'Stacked Graph', control: 'stackedChart', before: 'Disabled', value: 'stackedByPercentage', after: 'Stacked by Percentage' },
  { panel: 'HighChartsComponent', host: HighChartsHostComponent, group: 'highchartsAppearanceOptions',
    select: 'Horizontal Alignment', control: 'title.align', before: 'Center', value: 'left', after: 'Left' },
  { panel: 'EChartsComponent', host: EChartsHostComponent, group: 'echartsAppearanceOptions',
    select: 'Horizontal Alignment', control: 'ecLegend.ecLegendHorizontalAlignment', before: 'Center', value: 'left', after: 'Left' },
  { panel: 'HighMapsComponent', host: HighMapsHostComponent, group: 'highmapsAppearanceOptions',
    select: 'Horizontal Alignment', control: 'title.align', before: 'Center', value: 'left', after: 'Left' }
];

describe('Chart option panels', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  // The form group of the selected library is enabled in the real app.
  const appearanceGroup = (group: string): FormGroup => {
    const form = TestBed.inject(FormFactoryService).createAppearanceGroup().get(`chartAppearance.${group}`) as FormGroup;
    form.enable();
    return form;
  };

  cases.forEach(c => {
    const render = () => {
      const fixture = TestBed.createComponent(c.host);
      const form = appearanceGroup(c.group);
      fixture.componentInstance.form = form;
      fixture.detectChanges();
      const shown = () => fixture.nativeElement.querySelector(`div[input][placeholder="${c.select}"]`).textContent;
      expect(shown()).toContain(c.before);
      return { fixture, form, shown };
    };

    it(`${c.panel} follows a programmatic form change`, () => {
      const { fixture, form, shown } = render();

      form.get(c.control)!.setValue(c.value);
      fixture.detectChanges();

      expect(shown()).toContain(c.after);
    });

    // What loading a saved chart does: write the form silently, then signal that the load finished.
    it(`${c.panel} follows a silent form write once a chart load completes`, () => {
      const { fixture, form, shown } = render();

      form.get(c.control)!.setValue(c.value, { emitEvent: false });
      TestBed.inject(DynamicFormHandlingService).updateFromFile = false;
      fixture.detectChanges();

      expect(shown()).toContain(c.after);
    });
  });

  it('HighMapsComponent shows the countries that arrive over HTTP after it rendered', () => {
    const fixture = TestBed.createComponent(HighMapsHostComponent);
    const form = appearanceGroup('highmapsAppearanceOptions');
    form.get('hmZoomTo.destination')!.setValue('GR');
    fixture.componentInstance.form = form;
    fixture.detectChanges();

    TestBed.inject(HttpTestingController)
      .expectOne(request => request.url.includes('restcountries'))
      .flush([{ name: { common: 'Greece', official: 'Hellenic Republic', nativeName: {} }, cca2: 'GR' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('div[input][placeholder="Country"]').textContent).toContain('Greece');
  });
});
