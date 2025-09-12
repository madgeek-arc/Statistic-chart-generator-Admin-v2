import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, of, fromEvent, Subscription } from 'rxjs';
import { map, filter, debounceTime, tap, switchAll, distinctUntilChanged } from 'rxjs/operators';
import { FieldAutocompleteService, AutocompleteResponse } from "../../../services/field-autocomplete-service/field-autocomplete.service";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from "../../../material/material.module";
import { AsyncPipe, NgClass, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'autocomplete-input-field',
  templateUrl: './autocomplete-input-field.component.html',
  styleUrls: ['./autocomplete-input-field.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    NgClass,
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    AsyncPipe
  ]
})

export class AutocompleteInputFieldComponent implements OnInit, AfterViewInit, OnDestroy {

  // The FormGroup of the current filter
  @Input() inputFormGroup: FormControl;
  // The index of the current filter input value
  @Input() filterValueIndex: any;
  // The selected field for the current filter
  @Input() filterfield: string;
  // Dom element for the autocomplete
  @ViewChild('autoInputField', {static: false}) valueInput: ElementRef;

  possibleFieldValues: Observable<Array<string>>;
  numberOfpossibleFieldValues: number;
  loading: boolean;
  typeToSearchDelay: number;
  autocompleteSubscription: Subscription;

  constructor(private fieldAutocompleteService: FieldAutocompleteService, private cdr: ChangeDetectorRef) {
    this.possibleFieldValues = of([]);
    this.typeToSearchDelay = 250;
    this.loading = false;
    this.numberOfpossibleFieldValues = 0;
  }

  ngOnInit() {
    // console.log('Autocomplete:');
    // console.log(this.inputFormGroup);
    // console.log(this.filterValueIndex);
  }

  ngAfterViewInit() {
    this.setupAutocompleteInputField();
  }

  ngOnDestroy() {
    this.autocompleteSubscription.unsubscribe();
  }

  setupAutocompleteInputField(): void {

    this.autocompleteSubscription = fromEvent(this.valueInput.nativeElement, 'keyup').pipe(
      map((inputVal: any) => inputVal.target.value),
      filter((text: string) => text.length > 0),
      debounceTime(this.typeToSearchDelay),
      tap(() => {this.possibleFieldValues = of([]); this.loading = true; this.cdr.markForCheck(); } ),
      map((queryText: string) => this.fieldAutocompleteService.getAutocompleteFields(this.filterfield, queryText)),
      switchAll())
      .subscribe(
        (result: AutocompleteResponse) => {
          console.log('Returned ' + result.count + ' possible values');
          this.possibleFieldValues = of(result.values);
          this.numberOfpossibleFieldValues = result.count;
          this.loading = false;
          this.cdr.markForCheck();
        },
        (err: any) => {
          console.log(err);
          this.numberOfpossibleFieldValues = -1;
          this.loading = false;
          this.cdr.markForCheck();
        },
        () => {
          this.loading = false;
          // this.cdr.detectChanges();
        }
      );
  }
}
