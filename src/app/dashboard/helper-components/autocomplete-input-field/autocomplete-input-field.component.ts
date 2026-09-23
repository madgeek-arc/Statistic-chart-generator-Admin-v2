import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  input
} from '@angular/core';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchAll, tap } from 'rxjs/operators';
import {
  AutocompleteResponse,
  FieldAutocompleteService
} from "../../../services/field-autocomplete-service/field-autocomplete.service";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { AsyncPipe } from "@angular/common";

@Component({
    selector: 'autocomplete-input-field',
    templateUrl: './autocomplete-input-field.component.html',
    styleUrls: ['./autocomplete-input-field.component.scss'],
    imports: [
        ReactiveFormsModule,
        AsyncPipe,
        MatAutocomplete,
        MatAutocompleteTrigger,
        MatOption
    ]
})

export class AutocompleteInputFieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  private fieldAutocompleteService = inject(FieldAutocompleteService);
  private cdr = inject(ChangeDetectorRef);

  // The FormGroup of the current filter
  readonly inputFormGroup = input<FormControl>(undefined);
  // The index of the current filter input value
  readonly filterValueIndex = input<any>(undefined);
  // The selected field for the current filter
  readonly filterfield = input<string>(undefined);
  // Dom element for the autocomplete
  @ViewChild('autoInputField', {static: false}) valueInput: ElementRef;
  // Trigger directive on the input, used to open / reposition the panel once async options load
  @ViewChild(MatAutocompleteTrigger) private autoTrigger?: MatAutocompleteTrigger;

  possibleFieldValues: Observable<string[] | null>;
  numberOfpossibleFieldValues: number;
  loading: boolean;
  focused = false;
  // True once at least one lookup has returned, so "No results" is not shown before the first search
  searched = false;
  // Keeps the mat-autocomplete panel closed (matAutocompleteDisabled) until the
  // first results for the current field are in, so the CDK overlay is positioned
  // once against the real option list instead of the empty list it would see if
  // it opened on focus. Reset when the field changes.
  panelReady = false;
  typeToSearchDelay: number;
  autocompleteSubscription: Subscription;

  constructor() {
    this.possibleFieldValues = of([]);
    this.typeToSearchDelay = 250;
    this.loading = false;
    this.numberOfpossibleFieldValues = 0;
  }

  ngAfterViewInit() {
    this.setupAutocompleteInputField();
  }

  ngOnChanges(changes: SimpleChanges) {
    // The filter field changed: any previously fetched values / "searched" state
    // belong to the old field. Rebuild the stream so a fresh distinctUntilChanged
    // does not swallow the next (identical, usually empty) focus query.
    if (changes['filterfield'] && !changes['filterfield'].firstChange && this.valueInput) {
      this.possibleFieldValues = of([]);
      this.numberOfpossibleFieldValues = 0;
      this.searched = false;
      this.loading = false;
      this.panelReady = false;
      this.autocompleteSubscription?.unsubscribe();
      this.setupAutocompleteInputField();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.autocompleteSubscription?.unsubscribe();
  }

  setupAutocompleteInputField(): void {

    const currentValue = () => (this.valueInput.nativeElement.value ?? '').trim();

    // Focusing the field fires a lookup immediately (empty query -> the dropdown
    // opens with the available values, or the "type to narrow" hint when the field
    // has more distinct values than the server will inline). Keystrokes are debounced.
    const focus$ = fromEvent(this.valueInput.nativeElement, 'focus').pipe(map(currentValue));
    const keyup$ = fromEvent(this.valueInput.nativeElement, 'keyup').pipe(
      map(currentValue),
      debounceTime(this.typeToSearchDelay)
    );

    this.autocompleteSubscription = merge(focus$, keyup$).pipe(
      distinctUntilChanged(),
      tap(() => {this.possibleFieldValues = of([]); this.loading = true; this.cdr.markForCheck(); } ),
      map((queryText: string) => this.fieldAutocompleteService.getAutocompleteFields(
        this.filterfield(), queryText.length ? queryText : null)),
      switchAll()).subscribe({
        next: (result: AutocompleteResponse | null) => {
          const firstOpen = !this.panelReady;
          // HttpClient yields `null` for an empty response body: treat it as no matches.
          // A response that has a count but no `values` means the field has too many
          // distinct values; normalise it to null so the template's `=== null` branch
          // ("type to narrow down") handles it instead of dereferencing undefined.
          this.possibleFieldValues = of(result ? (result.values ?? null) : []);
          this.numberOfpossibleFieldValues = result?.count ?? 0;
          this.loading = false;
          this.searched = true;
          this.panelReady = true;
          this.cdr.markForCheck();
          this.revealPanel(firstOpen);
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
          this.searched = true;
          this.numberOfpossibleFieldValues = -1;
          const firstOpen = !this.panelReady;
          this.panelReady = true;
          this.cdr.markForCheck();
          this.revealPanel(firstOpen);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Bring the just-loaded options on screen. On the first results for a field the
   * panel was held closed (matAutocompleteDisabled), so open it now that it can be
   * positioned against the real list; on later keystroke results the panel is
   * already open and only its height changed, so a reposition is enough. Skips if
   * the input lost focus while the request was in flight.
   */
  private revealPanel(firstOpen: boolean): void {
    setTimeout(() => {
      if (document.activeElement !== this.valueInput?.nativeElement) { return; }
      if (firstOpen) {
        this.autoTrigger?.openPanel();
      } else {
        this.autoTrigger?.updatePosition();
      }
    });
  }
}
