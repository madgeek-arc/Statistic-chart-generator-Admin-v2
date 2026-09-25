import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { filter, first } from 'rxjs/operators';

import { DynamicTreeDatabase } from './dynamic-tree-database.service';
import { UrlProviderService } from '../url-provider-service/url-provider.service';
import { answerProfile, entityNode, profileNamed } from './dynamic-tree-database.testing';

// The entity map belongs to the selected profile. A chart link can bring another profile in
// while the dashboard is in use, and its entities take a moment to arrive. Whatever asks for
// them in that moment must get the new profile's, never the previous one's.
describe('DynamicTreeDatabase', () => {
  let db: DynamicTreeDatabase;
  let http: HttpTestingController;
  let serviceUrl: string;

  const answer = (profile: string, entities: ReturnType<typeof entityNode>[]) => answerProfile(http, serviceUrl, profile, entities);
  const rootFields = (entity: string): string[] | undefined =>
    db.getRootNode(entity)?.value?.fields.map(field => field.name);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    db = TestBed.inject(DynamicTreeDatabase);
    http = TestBed.inject(HttpTestingController);
    serviceUrl = TestBed.inject(UrlProviderService).serviceURL;
    // The profile service the database depends on asks for the list of profiles when it is created.
    http.expectOne(serviceUrl + '/schema/profiles').flush([]);
  });

  it('serves the entities of the profile it has loaded', () => {
    db.changeEntityMap(profileNamed('openaire'));
    answer('openaire', [entityNode('result', { title: 'text' })]);

    expect(rootFields('result')).toEqual(['title']);
  });

  it('keeps serving the loaded entities when the same profile is selected again', () => {
    db.changeEntityMap(profileNamed('openaire'));
    answer('openaire', [entityNode('result', { title: 'text' })]);

    // As when the Data step is opened again.
    db.changeEntityMap(profileNamed('openaire'));

    expect(rootFields('result')).toEqual(['title']);
  });

  describe('when another profile is selected and has not loaded yet', () => {
    beforeEach(() => {
      db.changeEntityMap(profileNamed('openaire'));
      answer('openaire', [entityNode('result', { title: 'text' })]);
      db.changeEntityMap(profileNamed('gr_monitor'));
    });

    it('holds no entities until the new profile has loaded', () => {
      expect(db.entityMap).toBeNull();
    });

    it('gives the new profile\'s map to whatever is waiting for one', () => {
      const seen: string[][] = [];
      db.entityMap$.pipe(filter(map => (map?.size ?? 0) > 0), first()).subscribe(map => seen.push([...map!.keys()]));
      expect(seen).toEqual([]);

      answer('gr_monitor', [entityNode('result_result', { relclass: 'text' })]);

      expect(seen).toEqual([['result_result']]);
    });

    it('serves an entity from the new profile even when the old profile has it too', () => {
      const root$ = db.getRootNode('result')!;
      expect(root$.value).toBeNull();

      answer('gr_monitor', [entityNode('result', { title: 'text', year: 'int' })]);

      expect(root$.value?.fields.map(field => field.name)).toEqual(['title', 'year']);
    });

    it('serves an entity that only the new profile has', () => {
      const root$ = db.getRootNode('result_result')!;

      answer('gr_monitor', [entityNode('result_result', { relclass: 'text' })]);

      expect(root$.value?.fields.map(field => field.name)).toEqual(['relclass']);
    });
  });

  it('ignores a late answer for a profile that is no longer selected', () => {
    db.changeEntityMap(profileNamed('one'));
    db.changeEntityMap(profileNamed('two'));

    answer('two', [entityNode('from_two', { x: 'text' })]);
    answer('one', [entityNode('from_one', { y: 'text' })]);

    expect([...db.entityMap.keys()]).toEqual(['from_two']);
  });
});
