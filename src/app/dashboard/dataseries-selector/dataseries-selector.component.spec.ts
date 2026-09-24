import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { DataseriesSelectorComponent } from './dataseries-selector.component';
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
  const addGroupBy = (seriesEl: HTMLElement) =>
    [...seriesEl.querySelectorAll('a')].find(a => a.textContent?.includes('Add Group By'));
  const click = (text: string, within: HTMLElement = el()) => {
    [...within.querySelectorAll('a')].find(a => a.textContent?.includes(text))!.click();
    fixture.detectChanges();
  };

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
