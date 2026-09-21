import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ViewSelectorComponent } from './view-selector.component';
import { MappingProfilesService, Profile } from '../../services/mapping-profiles-service/mapping-profiles.service';

const profile = (name: string, shareholders: string[], description: string): Profile =>
  Object.assign(new Profile(), { name, shareholders, description, usage: `${name} usage`, complexity: 5 });

describe('ViewSelectorComponent', () => {
  const openaire = profile('openaire', ['All'], 'The OpenAIRE graph');
  const monitor = profile('monitor', ['Monitors'], 'Monitor dashboards');
  let profiles$: BehaviorSubject<Profile[]>;
  let selected$: BehaviorSubject<Profile | null>;
  let fixture: ComponentFixture<ViewSelectorComponent>;

  const texts = (selector: string): (string | undefined)[] =>
    Array.from<Element>(fixture.nativeElement.querySelectorAll(selector)).map(e => e.textContent?.trim());

  beforeEach(() => {
    profiles$ = new BehaviorSubject<Profile[]>([]);
    selected$ = new BehaviorSubject<Profile | null>(null);
    TestBed.configureTestingModule({
      imports: [ViewSelectorComponent],
      providers: [{ provide: MappingProfilesService, useValue: { mappingProfiles$: profiles$, selectedProfile$: selected$ } }]
    });
    fixture = TestBed.createComponent(ViewSelectorComponent);
    fixture.detectChanges();
  });

  // The profiles come from the backend, after the component has rendered.
  it('shows the profiles the service provides once they arrive', () => {
    expect(texts('.vs-card-name')).toEqual([]);
    expect(texts('.vs-empty')).toEqual(['No views match your search.']);

    profiles$.next([openaire, monitor]);
    fixture.detectChanges();

    expect(texts('.vs-card-name')).toEqual(['openaire', 'monitor']);
  });

  it('builds a filter tab for each shareholder in the profiles', () => {
    expect(texts('.vs-filter-btn')).toEqual(['All']);

    profiles$.next([openaire, monitor]);
    fixture.detectChanges();

    expect(texts('.vs-filter-btn')).toEqual(['All', 'Monitors']);
  });

  // The service reports the selection when a chart is loaded from a URL or a file.
  it('highlights the profile the service reports as selected', () => {
    profiles$.next([openaire, monitor]);
    selected$.next(monitor);
    fixture.detectChanges();

    expect(texts('.vs-card--selected .vs-card-name')).toEqual(['monitor']);
  });

  it('emits profileDetailsChange and moves the highlight when a card is clicked', () => {
    profiles$.next([openaire, monitor]);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.profileDetailsChange.subscribe(change => emitted.push(change));

    fixture.nativeElement.querySelectorAll('.vs-card')[0].click();
    fixture.detectChanges();

    expect(emitted).toEqual([{ profile: openaire, manualChange: true }]);
    expect(texts('.vs-card--selected .vs-card-name')).toEqual(['openaire']);
  });

  it('filters the cards by the search text', () => {
    profiles$.next([openaire, monitor]);
    fixture.detectChanges();

    const search: HTMLInputElement = fixture.nativeElement.querySelector('.vs-search-input');
    search.value = 'mon';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(texts('.vs-card-name')).toEqual(['monitor']);
  });

  it('filters the cards by the selected tab', () => {
    profiles$.next([openaire, monitor]);
    fixture.detectChanges();

    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.vs-filter-btn'))
      .find(button => button.textContent?.trim() === 'Monitors')!.click();
    fixture.detectChanges();

    expect(texts('.vs-card-name')).toEqual(['monitor']);
    expect(texts('.vs-filter-btn--active')).toEqual(['Monitors']);
  });
});
