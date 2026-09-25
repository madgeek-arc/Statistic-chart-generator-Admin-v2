import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { SelectAttributeComponent } from './select-attribute.component';
import { CachedEntityNode, DynamicEntityNode, FieldNode } from './dynamic-entity-tree/entity-tree-nodes.types';
import { DynamicTreeDatabase } from '../../../services/dynamic-tree-database/dynamic-tree-database.service';
import { answerProfile, entityNode, profileNamed } from '../../../services/dynamic-tree-database/dynamic-tree-database.testing';
import { MappingProfilesService } from '../../../services/mapping-profiles-service/mapping-profiles.service';
import { UrlProviderService } from '../../../services/url-provider-service/url-provider.service';

@Component({
    template: `<select-attribute [formInput]="control" [chosenEntity]="null"></select-attribute>`,
    imports: [SelectAttributeComponent]
})
class HostComponent {
  control = new FormControl<FieldNode | null>(null);
}

describe('SelectAttributeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent]
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  // Regression test for a naming collision: SelectAttributeComponent's own
  // @Input used to be named `formControl` with no alias, which matches
  // Angular's built-in ReactiveFormsModule FormControlDirective selector
  // ([formControl]). Both directives activated on the same element, and the
  // built-in one threw `control.registerOnChange is not a function`.
  it('wires up via [formInput] without throwing', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('propagates a selected field to the bound FormControl', () => {
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as SelectAttributeComponent;

    const field = new FieldNode();
    field.name = 'title';
    field.type = 'string';
    const node = new DynamicEntityNode([], 'dataset', []);

    component.nodeSelected(field, node);

    expect(host.control.value?.name).toBe('dataset.title');
    expect(host.control.value?.type).toBe('string');
  });
});

// What the user sees. The entity's fields arrive from the tree database after the field is shown,
// and a saved field is applied on a timer, so the component must refresh its own view.
class FakeTreeDatabase {
  readonly map$ = new BehaviorSubject<Map<string, CachedEntityNode> | null>(null);

  // Like the real database: answers as soon as the profile's entity map has loaded.
  private whenLoaded(then: (map: Map<string, CachedEntityNode>) => void): void {
    this.map$.pipe(filter(map => map !== null), first()).subscribe(map => then(map!));
  }

  getRootNode(entity: string): BehaviorSubject<DynamicEntityNode | null> {
    const root$ = new BehaviorSubject<DynamicEntityNode | null>(null);
    this.whenLoaded(map => {
      const cached = map.get(entity);
      if (cached) root$.next(new DynamicEntityNode(cached.fields, cached.name, [], null));
    });
    return root$;
  }

  getChildren(node: DynamicEntityNode): BehaviorSubject<DynamicEntityNode[]> {
    const children$ = new BehaviorSubject<DynamicEntityNode[]>([]);
    this.whenLoaded(map => children$.next((map.get(node.name)?.relations ?? [])
      .map(name => map.get(name)!)
      .map(cached => new DynamicEntityNode(cached.fields, cached.name, [...node.path], undefined, node))));
    return children$;
  }

  changeEntityMap(): void { /* not used here */ }
}

const field = (name: string, type: string): FieldNode => Object.assign(new FieldNode(), { name, type });
const entityMap = new Map<string, CachedEntityNode>([
  ['result', { name: 'result', fields: [field('title', 'text'), field('year', 'int')], relations: ['project'] }],
  ['project', { name: 'project', fields: [field('acronym', 'text')], relations: [] }]
]);

@Component({
  template: `<select-attribute [formInput]="control" [chosenEntity]="entity"></select-attribute>`,
  imports: [SelectAttributeComponent]
})
class DashboardLikeHostComponent {
  control = new FormControl<FieldNode | null>(null);
  entity: string | null = 'result';
}

describe('SelectAttributeComponent rendered', () => {
  let fixture: ComponentFixture<DashboardLikeHostComponent>;
  let db: FakeTreeDatabase;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardLikeHostComponent],
      providers: [{ provide: DynamicTreeDatabase, useClass: FakeTreeDatabase }]
    });
    db = TestBed.inject(DynamicTreeDatabase) as unknown as FakeTreeDatabase;
    fixture = TestBed.createComponent(DashboardLikeHostComponent);
  });

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
  const menuText = () => document.querySelector('.mat-mdc-menu-panel')?.textContent ?? '';
  const settle = () => { tick(200); fixture.detectChanges(); };

  it('shows a saved field once the entity fields arrive', fakeAsync(() => {
    fixture.componentInstance.control.setValue(field('result.title', 'text'));
    fixture.detectChanges();
    db.map$.next(entityMap);
    settle();

    expect(button().textContent).toContain('Title');
  }));

  it('lists the entity fields, and a related entity\'s fields once it is expanded', fakeAsync(() => {
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();
    db.map$.next(entityMap);
    fixture.detectChanges();
    settle();
    expect(menuText()).toContain('Year');

    const projectToggle = [...document.querySelectorAll<HTMLElement>('.mat-mdc-menu-panel [matTreeNodeToggle], .mat-mdc-menu-panel .mat-tree-node.header')]
      .find(el => el.textContent?.includes('Project'))!;
    projectToggle.click();
    fixture.detectChanges();
    settle();

    expect(menuText()).toContain('Acronym');
  }));

  it('shows the field picked from the menu', fakeAsync(() => {
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();
    db.map$.next(entityMap);
    fixture.detectChanges();
    settle();

    [...document.querySelectorAll<HTMLElement>('.mat-mdc-menu-panel a.item')].find(a => a.textContent?.includes('Year'))!.click();
    fixture.detectChanges();

    expect(button().textContent).toContain('Year');
    expect(fixture.componentInstance.control.value?.name).toBe('result.year');
    settle();
  }));
});

// Loading a chart link of another profile into a dashboard that is in use: the profile changes
// underneath fields that are already asking for their entity. OpenAIRE All-inclusive has no
// result_result entity, and the gr_monitor link is built on it.
describe('SelectAttributeComponent when the profile changes while its entities load', () => {
  let fixture: ComponentFixture<DashboardLikeHostComponent>;
  let http: HttpTestingController;
  let serviceUrl: string;
  let profiles: MappingProfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardLikeHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    serviceUrl = TestBed.inject(UrlProviderService).serviceURL;
    profiles = TestBed.inject(MappingProfilesService);
    TestBed.inject(DynamicTreeDatabase);
    http.expectOne(serviceUrl + '/schema/profiles').flush([profileNamed('openaire'), profileNamed('gr_monitor')]);

    profiles.changeSelectedProfile('openaire');
    answerProfile(http, serviceUrl, 'openaire', [entityNode('result', { title: 'text' })]);
    fixture = TestBed.createComponent(DashboardLikeHostComponent);
  });

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  it('shows the saved field of an entity that only the new profile has', fakeAsync(() => {
    profiles.changeSelectedProfile('gr_monitor');
    fixture.componentInstance.entity = 'result_result';
    fixture.componentInstance.control.setValue(field('result_result.relclass', 'text'));
    fixture.detectChanges();

    answerProfile(http, serviceUrl, 'gr_monitor', [entityNode('result_result', { relclass: 'text' })]);
    tick(200);
    fixture.detectChanges();

    expect(button().textContent).toContain('Relclass');
  }));

  it('lists the new profile\'s fields for an entity both profiles have', fakeAsync(() => {
    profiles.changeSelectedProfile('gr_monitor');
    fixture.componentInstance.entity = 'result';
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();

    answerProfile(http, serviceUrl, 'gr_monitor', [entityNode('result', { title: 'text', year: 'int' })]);
    tick(200);
    fixture.detectChanges();

    expect(document.querySelector('.mat-mdc-menu-panel')?.textContent).toContain('Year');
  }));
});
