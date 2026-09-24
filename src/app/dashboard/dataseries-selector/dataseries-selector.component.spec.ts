import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { DataseriesSelectorComponent } from './dataseries-selector.component';
import { InputComponent } from '../../shared/input.component';
import { DbSchemaService } from '../../services/db-schema-service/db-schema.service';
import { DynamicTreeDatabase } from '../../services/dynamic-tree-database/dynamic-tree-database.service';
import { FormFactoryService } from '../../services/form-factory-service/form-factory-service';

@Component({
  template: `<app-dataseries-selector [selectedProfile]="profile"/>`,
  imports: [DataseriesSelectorComponent]
})
class DashboardLikeHostComponent {
  profile = new FormControl('');
}

// What the user sees. Most of what the panel shows changes without any event inside it: the
// profile's entities arrive over HTTP, and the chart type is chosen in another step of the dashboard.
describe('DataseriesSelectorComponent', () => {
  let fixture: ComponentFixture<DashboardLikeHostComponent>;
  let root: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardLikeHostComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        // Answers after a while, as over HTTP.
        { provide: DbSchemaService, useValue: { getAvailableEntities: () => of(['result', 'project']).pipe(delay(100)) } },
        { provide: DynamicTreeDatabase, useValue: { changeEntityMap: (): void => undefined, getRootNode: () => new BehaviorSubject(null) } }
      ]
    });
    root = TestBed.inject(FormFactoryService).createForm();
    fixture = TestBed.createComponent(DashboardLikeHostComponent);
    fixture.detectChanges();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const series = (): HTMLElement[] => [...el().querySelectorAll<HTMLElement>('#switcher-content > li')];
  const diagram = () => root.get('category.diagram.diagramId') as FormControl;
  const addGroupBy = (seriesEl: HTMLElement) =>
    [...seriesEl.querySelectorAll('a')].find(a => a.textContent?.includes('Add Group By'));
  const click = (text: string, within: HTMLElement = el()) => {
    [...within.querySelectorAll('a')].find(a => a.textContent?.includes(text))!.click();
    fixture.detectChanges();
  };

  it('offers a profile\'s entities once they load', fakeAsync(() => {
    const entityOptions = () => fixture.debugElement.query(By.css('[placeholder="Entity"]'))
      .injector.get(InputComponent).optionsArray().map(option => option.value);
    expect(entityOptions()).toEqual([]);

    fixture.componentInstance.profile.setValue('OpenAIRE Monitor');
    tick(100);
    fixture.detectChanges();

    expect(entityOptions()).toEqual(['result', 'project']);
  }));

  it('asks for a chart type per series once the chart becomes a combo', () => {
    expect(el().querySelector('[placeholder="Chart Type"]')).toBeNull();

    diagram().setValue(13);
    fixture.detectChanges();

    expect(el().querySelector('[placeholder="Chart Type"]')).not.toBeNull();
  });

  it('hides the X axis while the Numbers chart is chosen', () => {
    const hasXAxis = () => el().textContent!.includes('X Axis');
    expect(hasXAxis()).toBeTrue();

    diagram().setValue(14);
    fixture.detectChanges();
    expect(hasXAxis()).toBeFalse();

    diagram().setValue(1);
    fixture.detectChanges();
    expect(hasXAxis()).toBeTrue();
  });

  it('shows a series added from outside the panel', () => {
    (root.get('dataseries') as FormArray).push(TestBed.inject(FormFactoryService).createDataseriesGroup(1));
    fixture.detectChanges();

    expect(series().length).toBe(2);
  });

  // Each series may group by at most two fields, counted per series.
  it('limits group-bys to two per series, not across series', fakeAsync(() => {
    click('Add Dataseries');
    tick();
    expect(series().length).toBe(2);

    click('Add Group By', series()[0]);

    expect(addGroupBy(series()[0])).toBeUndefined();
    expect(addGroupBy(series()[1])).toBeDefined();
  }));

  it('does not offer a third group-by on a loaded series that already has two', () => {
    const factory = TestBed.inject(FormFactoryService);
    const loaded = factory.createDataseriesGroup(1);
    (loaded.get('data.xaxisData') as FormArray).push(factory.createXaxisEntityField());
    (root.get('dataseries') as FormArray).setControl(0, loaded);
    fixture.detectChanges();

    expect(addGroupBy(series()[0])).toBeUndefined();
  });
});
