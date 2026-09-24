import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  input,
  signal
} from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchAll, tap } from 'rxjs/operators';
import {
  AutocompleteResponse,
  FieldAutocompleteService
} from "../../../services/field-autocomplete-service/field-autocomplete.service";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';

@Component({
    selector: 'autocomplete-input-field',
    templateUrl: './autocomplete-input-field.component.html',
    styleUrls: ['./autocomplete-input-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatAutocomplete,
        MatAutocompleteTrigger,
        MatOption
    ]
})

export class AutocompleteInputFieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  private fieldAutocompleteService = inject(FieldAutocompleteService);

  // The FormGroup of the current filter
  readonly inputFormGroup = input<FormControl>(undefined);
  // The selected field for the current filter
  readonly filterfield = input<string>(undefined);
  // Dom element for the autocomplete
  @ViewChild('autoInputField', {static: false}) valueInput: ElementRef;
  // Trigger directive on the input, used to open / reposition the panel once async options load
  @ViewChild(MatAutocompleteTrigger) private autoTrigger?: MatAutocompleteTrigger;

  // The values of the last lookup; null when the field has too many to list
  readonly possibleFieldValues = signal<string[] | null>([]);
  // How many values the field has; -1 when the lookup failed
  readonly numberOfpossibleFieldValues = signal(0);
  readonly loading = signal(false);
  readonly focused = signal(false);
  // True once at least one lookup has returned, so "No results" is not shown before the first search
  readonly searched = signal(false);
  // Keeps the mat-autocomplete panel closed (matAutocompleteDisabled) until the
  // first results for the current field are in, so the CDK overlay is positioned
  // once against the real option list instead of the empty list it would see if
  // it opened on focus. Reset when the field changes.
  readonly panelReady = signal(false);
  readonly typeToSearchDelay = 250;
  autocompleteSubscription: Subscription;

  ngAfterViewInit() {
    this.setupAutocompleteInputField();
  }

  ngOnChanges(changes: SimpleChanges) {
    // The filter field changed: any previously fetched values / "searched" state
    // belong to the old field. Rebuild the stream so a fresh distinctUntilChanged
    // does not swallow the next (identical, usually empty) focus query.
    if (changes['filterfield'] && !changes['filterfield'].firstChange && this.valueInput) {
      this.possibleFieldValues.set([]);
      this.numberOfpossibleFieldValues.set(0);
      this.searched.set(false);
      this.loading.set(false);
      this.panelReady.set(false);
      this.autocompleteSubscription?.unsubscribe();
      this.setupAutocompleteInputField();
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
      tap(() => { this.possibleFieldValues.set([]); this.loading.set(true); }),
      map((queryText: string) => this.fieldAutocompleteService.getAutocompleteFields(
        this.filterfield(), queryText.length ? queryText : null)),
      switchAll()).subscribe({
        next: (result: AutocompleteResponse | null) => {
          const firstOpen = !this.panelReady();
          // HttpClient yields `null` for an empty response body: treat it as no matches.
          // A response that has a count but no `values` means the field has too many
          // distinct values; normalise it to null so the template's `=== null` branch
          // ("type to narrow down") handles it instead of dereferencing undefined.
          this.possibleFieldValues.set(result ? (result.values ?? null) : []);
          this.numberOfpossibleFieldValues.set(result?.count ?? 0);
          this.loading.set(false);
          this.searched.set(true);
          this.panelReady.set(true);
          this.revealPanel(firstOpen);
        },
        error: (err: unknown) => {
          console.error(err);
          this.loading.set(false);
          this.searched.set(true);
          this.numberOfpossibleFieldValues.set(-1);
          const firstOpen = !this.panelReady();
          this.panelReady.set(true);
          this.revealPanel(firstOpen);
        },
        complete: () => {
          this.loading.set(false);
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
