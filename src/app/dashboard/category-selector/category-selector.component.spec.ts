import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { CategorySelectorComponent } from './category-selector.component';
import { DiagramCategoryService } from '../../services/diagram-category-service/diagram-category.service';
import { ISupportedCategory } from '../../services/supported-chart-types-service/supported-chart-types.service';

const category = (diagramId: number, name: string): ISupportedCategory => ({
  type: 'chart',
  supportedLibraries: [],
  diagramId,
  name,
  description: `${name} chart`,
  imageURL: 'images/imagePlaceholder.svg'
});

describe('CategorySelectorComponent', () => {
  const bar = category(1, 'Bar');
  const pie = category(2, 'Pie');
  let selected$: BehaviorSubject<ISupportedCategory | null>;
  let fixture: ComponentFixture<CategorySelectorComponent>;

  const names = (selector: string): (string | undefined)[] =>
    Array.from<Element>(fixture.nativeElement.querySelectorAll(selector)).map(e => e.textContent?.trim());

  beforeEach(() => {
    selected$ = new BehaviorSubject<ISupportedCategory | null>(null);
    TestBed.configureTestingModule({
      imports: [CategorySelectorComponent],
      providers: [{
        provide: DiagramCategoryService,
        useValue: {
          selectedDiagramCategory$: selected$,
          supportedChartTypes$: new BehaviorSubject<ISupportedCategory[]>([bar, pie]),
          supportedPolarTypes$: new BehaviorSubject<ISupportedCategory[]>([]),
          supportedMaps$: new BehaviorSubject<ISupportedCategory[]>([]),
          supportedSpecialisedDiagrams$: new BehaviorSubject<ISupportedCategory[]>([]),
          supportedMiscTypes$: new BehaviorSubject<ISupportedCategory[]>([])
        }
      }]
    });
    fixture = TestBed.createComponent(CategorySelectorComponent);
    fixture.detectChanges();
  });

  it('renders a card for each supported chart type', () => {
    expect(names('.dc-card-name')).toEqual(['Bar', 'Pie']);
  });

  // The service reports the selection when a chart is loaded from a URL or a file, so the
  // highlight has to follow it although nothing happened inside this component.
  it('highlights the card the service reports as selected', () => {
    selected$.next(pie);
    fixture.detectChanges();

    expect(names('.dc-card--selected .dc-card-name')).toEqual(['Pie']);
  });

  it('emits selectedChartChange and moves the highlight when a card is clicked', () => {
    const emitted: ISupportedCategory[] = [];
    fixture.componentInstance.selectedChartChange.subscribe(chart => emitted.push(chart));

    fixture.nativeElement.querySelectorAll('.dc-card')[0].click();
    fixture.detectChanges();

    expect(emitted).toEqual([bar]);
    expect(names('.dc-card--selected .dc-card-name')).toEqual(['Bar']);
  });
});
