import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { BehaviorSubject } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DynamicFormHandlingService } from '../services/dynamic-form-handling-service/dynamic-form-handling.service';
import { FormFactoryService } from '../services/form-factory-service/form-factory-service';
import { ChartExportingService } from '../services/chart-exporting-service/chart-exporting.service';
import { MappingProfilesService, Profile } from '../services/mapping-profiles-service/mapping-profiles.service';
import { DiagramCategoryService } from '../services/diagram-category-service/diagram-category.service';
import { ISupportedCategory } from '../services/supported-chart-types-service/supported-chart-types.service';
import { ChartInfo, OptionsData } from '../services/nl-chat-service/nl-chat.service';
import { HighChartsChart } from '../services/supported-libraries-service/models/chart-description-HighCharts.model';

// The dashboard's own behaviour, with its panels stood in for by empty ones that have the same
// selectors, inputs and outputs. The steps, the nav, the action bar and the chart preview are what
// is under test, so the specs drive them the way the panels and the services do.
@Component({ selector: 'app-view-selector', template: '' })
class ViewSelectorStub {
  profileDetailsChange = output<{ profile: Profile; manualChange: boolean } | null>();
}

@Component({ selector: 'app-category-selector', template: '' })
class CategorySelectorStub {
  selectedChartChange = output<ISupportedCategory>();
}

@Component({ selector: 'app-dataseries-selector', template: '' })
class DataseriesSelectorStub {
  selectedProfile = input<unknown>();
}

@Component({ selector: 'app-nl-chat', template: '' })
class NlChatStub {
  phase = input<'query' | 'options'>('query');
  queryChatComplete = output<ChartInfo[]>();
  optionChatComplete = output<OptionsData>();
}

@Component({ selector: 'app-customise-appearance', template: '' })
class CustomiseAppearanceStub {}

// eslint-disable-next-line @angular-eslint/component-selector -- stands in for the real chart-frame, whose selector has no app prefix
@Component({ selector: 'chart-frame', template: '<i class="chart-frame-stub">{{ chartUrl() }}</i>' })
class ChartFrameStub {
  chartUrl = input<string | null>(null);
}

// eslint-disable-next-line @angular-eslint/component-selector -- stands in for the real generated-short-url-field, whose selector has no app prefix
@Component({ selector: 'generated-short-url-field', template: '' })
class ShortUrlFieldStub {
  shortUrl = input<unknown>();
  isUrlLoading = input<unknown>();
  dataName = input<string>();
}

@Component({ template: '<app-dashboard></app-dashboard>', imports: [DashboardComponent] })
class HostComponent {}

const profile = (name: string): Profile =>
  Object.assign(new Profile(), { name, description: `${name} data`, usage: 'stats', shareholders: ['OpenAIRE'], complexity: 5 });

const column = {
  type: 'column', name: 'column', diagramId: 1, description: 'Column diagram', imageURL: 'chart-type-svgs/column.svg',
  isPolar: false, isHidden: false, supportedLibraries: ['HighCharts']
} as unknown as ISupportedCategory;

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let changeSelectedProfile: jasmine.Spy;

  beforeEach(() => {
    changeSelectedProfile = jasmine.createSpy('changeSelectedProfile');
    TestBed.overrideComponent(DashboardComponent, {
      set: {
        imports: [
          ViewSelectorStub, CategorySelectorStub, DataseriesSelectorStub, NlChatStub, CustomiseAppearanceStub,
          ChartFrameStub, ShortUrlFieldStub, MatTabGroup, MatTab, AsyncPipe, NgOptimizedImage
        ]
      }
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MappingProfilesService, useValue: { changeSelectedProfile, selectedProfile$: new BehaviorSubject(null) } },
        { provide: DiagramCategoryService, useValue: {
          changeDiagramCategory: (): void => undefined, availableDiagrams: [], selectedDiagramCategory$: new BehaviorSubject(null)
        } }
      ]
    });
    fixture = TestBed.createComponent(HostComponent);
  });

  const el = (selector: string): HTMLElement | null => fixture.nativeElement.querySelector(selector);
  const text = (selector: string): string => el(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const stub = <T>(type: new (...args: never[]) => T): T => fixture.debugElement.query(By.directive(type)).componentInstance;
  const steps = (): HTMLElement[] => [...fixture.nativeElement.querySelectorAll('#navTab > li.nav-step')];
  const activeStep = (): number => steps().findIndex(step => step.classList.contains('nav-step--active'));
  const lockedSteps = (): number[] => steps().flatMap((step, index) => step.classList.contains('nav-step--locked') ? [index] : []);
  const subtitle = (index: number): string => steps()[index].querySelector('.nav-step-subtitle')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const button = (selector: string): HTMLButtonElement => el(selector) as HTMLButtonElement;
  const createButton = (): HTMLButtonElement => button('.actionButtons .uk-button-primary');
  const settle = () => { tick(); fixture.detectChanges(); tick(); };
  const start = () => { fixture.detectChanges(); settle(); };
  const formRoot = (): FormGroup => TestBed.inject(FormFactoryService).getFormRoot();

  const chooseView = (name = 'openaire') => {
    stub(ViewSelectorStub).profileDetailsChange.emit({ profile: profile(name), manualChange: false });
    fixture.detectChanges();
  };
  const goToChartType = () => { chooseView(); button('.action-btn-continue').click(); settle(); };
  const goToData = () => {
    goToChartType();
    stub(CategorySelectorStub).selectedChartChange.emit(column);
    fixture.detectChanges();
    button('.action-btn-continue').click();
    settle();
  };
  // Makes every control valid, the way filling the panels in correctly would.
  const makeValid = () => {
    const clear = (control: AbstractControl) => {
      if (control instanceof FormGroup) Object.values(control.controls).forEach(clear);
      if (control instanceof FormArray) control.controls.forEach(clear);
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    };
    clear(formRoot());
    formRoot().updateValueAndValidity();
  };
  const askAgentTab = (): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('.seg-btn')].find(tab => tab.textContent.includes('Ask agent'));

  it('starts on the view step, asking for a view', fakeAsync(() => {
    start();

    expect(activeStep()).toBe(0);
    expect(subtitle(0)).toBe('Choose the data source');
    expect(text('.action-bar-view')).toContain('Pick a view to begin');
    expect(button('.action-btn-continue').disabled).toBeTrue();
    expect(lockedSteps()).toEqual([1, 2, 3]);
  }));

  it('names the view the panel reports, and lets the user continue', fakeAsync(() => {
    start();
    chooseView('gr_monitor');

    expect(subtitle(0)).toBe('gr_monitor');
    expect(text('.action-bar-view')).toContain('Selected: gr_monitor');
    expect(text('.vd-name')).toBe('gr_monitor');
    expect(button('.action-btn-continue').disabled).toBeFalse();
  }));

  it('shows the details of the view the panel reports', fakeAsync(() => {
    start();
    expect(text('.vd-empty-title')).toBe('No view selected');

    chooseView('gr_monitor');

    expect(text('.vd-desc')).toBe('gr_monitor data');
    expect(text('.vd-tag')).toBe('OpenAIRE');
    expect(text('.vd-stat-value')).toBe('5M');
  }));

  it('moves on from the nav once a view is chosen', fakeAsync(() => {
    start();
    steps()[1].querySelector('a')!.click();
    settle();
    expect(activeStep()).toBe(0);

    chooseView();
    steps()[1].querySelector('a')!.click();
    settle();

    expect(activeStep()).toBe(1);
  }));

  it('moves to the chart type step, and back', fakeAsync(() => {
    start();
    goToChartType();

    expect(activeStep()).toBe(1);
    expect(changeSelectedProfile).toHaveBeenCalledWith('openaire');
    expect(subtitle(1)).toBe('Pick a visualization');
    expect(text('.action-bar-view')).toContain('Pick a chart type to continue');
    expect(lockedSteps()).toEqual([2, 3]);

    button('.action-btn-back').click();
    settle();

    expect(activeStep()).toBe(0);
  }));

  it('names the chart type the panel reports, and moves on to the data step', fakeAsync(() => {
    start();
    goToChartType();

    stub(CategorySelectorStub).selectedChartChange.emit(column);
    fixture.detectChanges();
    expect(subtitle(1)).toBe('column');
    expect(text('.action-bar-view')).toContain('Chart type: column');
    expect(button('.action-btn-continue').disabled).toBeFalse();

    button('.action-btn-continue').click();
    settle();

    expect(activeStep()).toBe(2);
    expect(lockedSteps()).toEqual([]);
    expect(createButton()).not.toBeNull();
  }));

  it('previews the chart type the panel reports', fakeAsync(() => {
    start();
    goToChartType();
    expect(text('.vd-panel-title')).toBe('Chart preview');
    expect(text('.vd-empty-title')).toBe('No chart type selected');

    stub(CategorySelectorStub).selectedChartChange.emit(column);
    fixture.detectChanges();

    expect(text('.vd-panel-title')).toBe('column preview');
    expect(text('.ct-best-for')).toContain('Compare values across a few categories');
    expect([...fixture.nativeElement.querySelectorAll('.ct-tag')].map(tag => (tag as HTMLElement).textContent)).toEqual(['categorical', 'comparison']);
    expect(el('.ct-preview-img')!.getAttribute('src')).toContain('chart-type-svgs/column.svg');
  }));

  it('lets Create Chart through only when the form is valid, or a chat query is ready', fakeAsync(() => {
    start();
    goToData();
    expect(createButton().disabled).toBeTrue();

    makeValid();
    fixture.detectChanges();
    expect(createButton().disabled).toBeFalse();

    formRoot().get('dataseries')!.setValidators(() => ({ invalid: true }));
    formRoot().get('dataseries')!.updateValueAndValidity();
    fixture.detectChanges();
    expect(createButton().disabled).toBeTrue();

    askAgentTab().click();
    fixture.detectChanges();
    stub(NlChatStub).queryChatComplete.emit([{ type: 'column', name: 'q', query: { nl: 'q', sig: 's', profile: 'openaire' } }]);
    fixture.detectChanges();
    expect(createButton().disabled).toBeFalse();
  }));

  // A saved chart, from a file or a link: it writes the form without events and announces that it is
  // done, and the dashboard then moves to the data step by itself.
  it('moves to the data step when a saved chart finishes loading', fakeAsync(() => {
    start();
    expect(activeStep()).toBe(0);

    TestBed.inject(DynamicFormHandlingService).loadFormObject = {
      view: { profile: 'gr_monitor' },
      category: { diagram: { type: 'column', name: 'column' } }
    };
    settle();

    expect(changeSelectedProfile).toHaveBeenCalledWith('gr_monitor');
    expect(activeStep()).toBe(2);
    expect(lockedSteps()).toEqual([]);
    expect(createButton()).not.toBeNull();
  }));

  it('starts over on Clear', fakeAsync(() => {
    start();
    goToData();
    expect(activeStep()).toBe(2);

    button('.actionButtons .uk-button-default').click();
    settle();

    expect(activeStep()).toBe(0);
    expect(lockedSteps()).toEqual([1, 2, 3]);
  }));

  describe('the chart preview', () => {
    it('asks for control values until there is a chart', fakeAsync(() => {
      start();
      goToData();

      expect(text('.iframe-container')).toContain('Add required control values to preview chart');
      expect(el('.chart-frame-stub')).toBeNull();
    }));

    it('shows the chart once its link is ready, and warns when the controls change after that', fakeAsync(() => {
      spyOn(TestBed.inject(DynamicFormHandlingService), 'submitForm');
      start();
      goToData();
      makeValid();
      fixture.detectChanges();
      createButton().click();

      TestBed.inject(ChartExportingService).changeChartUrl(new HighChartsChart('column', false));
      settle();
      expect(el('.chart-frame-stub')!.textContent).toContain('/chart?json=');
      expect(text('.iframe-container')).not.toContain('Your chart is not up to date');

      formRoot().get('category.diagram.description')!.setValue('changed');
      settle();
      expect(text('.iframe-container')).toContain('Your chart is not up to date');

      createButton().click();
      settle();
      expect(text('.iframe-container')).not.toContain('Your chart is not up to date');
    }));
  });
});
