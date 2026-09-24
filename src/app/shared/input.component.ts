import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { refreshOnFormChanges } from './refresh-on-form-changes';

// A select with more than six options becomes an autocomplete.
export type InputType =
    'text'
    | 'number'
    | 'color'
    | 'URL'
    | 'autocomplete'
    | 'select';

export interface Option {
  icon?: string;
  iconClass?: string;
  value: unknown;
  label: string;
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
}

export interface Placeholder {
  label: string;
  static?: boolean;
  tooltip?: string;
}

declare const UIkit: { dropdown(element: HTMLElement): { show(): void; hide(): void } };

/**
 * Adapted from OpenAIRE's shared input, keeping only the field types this app uses.
 */
@Component({
    selector: '[input]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:keydown.arrowUp)': 'arrowUp($event)',
        '(window:keydown.arrowDown)': 'arrowDown($event)',
        '(window:keydown.enter)': 'enter($event)',
        '(document:click)': 'click($event)',
        '(window:keydown.escape)': 'esc()'
    },
    imports: [ReactiveFormsModule],
    template: `
    @if (control(); as control) {
      <div [id]="id">
        <div class="input-wrapper flat" [class.disabled]="control.disabled" [class.opened]="opened()"
          [class.focused]="focused()" [class.hint]="hint()"
          [class.active]="!focused() && (control.value || control.value === 0 || isSelectable() || getLabel(control.value))"
          [class.danger]="(control.invalid && (control.touched || searchControl.touched)) || (searchControl.invalid && searchControl.touched)">
          <div #inputBox class="input-box" [class.select]="isSelectable()"
            [class.static]="placeholderInfo().static">
            @if (!placeholderInfo().static && placeholderInfo().label) {
              <div class="placeholder">
                <label [for]="fieldId">{{ placeholderInfo().label }} @if (required()) {
                  <sup>*</sup>
                }</label>
              </div>
            }
            <div class="uk-flex uk-flex-middle"
               [attr.uk-tooltip]="placeholderInfo().tooltip?('title: ' + placeholderInfo().tooltip + '; delay: 500; pos: bottom-left'):
                       ((tooltip() && !focused() && (control.value || hint() || placeholderInfo().label))?
                       ('title: ' + (control.value ?getTooltip(control.value):(hint()?hint():placeholderInfo().label)) + '; delay: 500; pos: bottom-left'):null)">
              @if (kind() === 'text' || kind() === 'URL') {
                <input #input class="input" [id]="fieldId"
                  [attr.placeholder]="placeholderInfo().static?placeholderInfo().label:hint()"
                  type="text" [formControl]="control"
                  [class.uk-text-truncate]="!focused()">
              }
              @if (kind() === 'number') {
                <input #input class="input" type="number" [id]="fieldId"
                  [attr.placeholder]="placeholderInfo().static?placeholderInfo().label:hint()"
                  [formControl]="control"
                  [class.uk-text-truncate]="!focused()">
              }
              @if (kind() === 'color') {
                <input #input class="input" type="color" [id]="fieldId"
                  [attr.placeholder]="placeholderInfo().static?placeholderInfo().label:hint()"
                  [formControl]="control"
                  [class.uk-text-truncate]="!focused()">
              }
              @if (kind() === 'select') {
                @if (!getLabel(control.value)) {
                  <div
                    class="input uk-width-expand uk-text-truncate"
                    [class.placeholder]="placeholderInfo().static"
                    [class.uk-disabled]="control.disabled">{{ placeholderInfo().static ? placeholderInfo().label : noValueSelected() }}
                  </div>
                } @else {
                  <div
                    class="input uk-width-expand uk-text-truncate"
                    [class.uk-disabled]="control.disabled">{{ getLabel(control.value) }}
                  </div>
                }
              }
              @if (kind() === 'autocomplete') {
                @if (focused()) {
                  <input [attr.placeholder]="placeholderInfo().static?placeholderInfo().label:hint()"
                    #searchInput class="input" [id]="fieldId" [formControl]="searchControl"
                    [class.uk-text-truncate]="!focused()">
                } @else if (!isSelectable()) {
                  <div
                    class="input uk-text-truncate"
                    [class.placeholder]="!getLabel(control.value)"
                    [class.uk-disabled]="control.disabled">{{ !getLabel(control.value) && placeholderInfo().static ? placeholderInfo().label : getLabel(control.value) }}
                  </div>
                } @else {
                  <div class="input uk-text-truncate"
                    [class.uk-disabled]="control.disabled">{{ getLabel(control.value) || noValueSelected() }}
                  </div>
                }
              }
              @if ((control.disabled && disabledIcon) || icon() || (isSelectable() && selectArrow()) || kind() === 'autocomplete') {
                <div
                  class="uk-margin-small-left icon">
                  @if (control.disabled && disabledIcon) {
                    <span class="uk-flex">
                      <span class="material-icons" style="font-size: 20px;">{{ disabledIcon }}</span>
                    </span>
                  }
                  @if (control.enabled) {
                    @if (!searchControl.value && icon()) {
                      <span class="uk-flex">
                        <span class="material-icons" style="font-size: 20px;">{{ icon() }}</span>
                      </span>
                    }
                    @if (!icon() && isSelectable() && selectArrow()) {
                      <span class="uk-flex">
                        <span class="material-icons" style="font-size: 20px;">{{ selectArrow() }}</span>
                      </span>
                    }
                    @if (focused() && kind() === 'autocomplete' && (!isSelectable() || searchControl.value)) {
                      <button
                        class="uk-close uk-icon" (click)="resetSearch($event)">
                        <span class="uk-flex"><span class="material-icons" style="font-size: 20px;">close</span></span>
                      </button>
                    }
                    @if ((!focused() && kind() === 'autocomplete' && !isSelectable()) ||
                      (kind() !== 'autocomplete' && !searchControl.value && !!control.value && !isSelectable())) {
                      <button
                        class="uk-close uk-icon" (click)="resetValue($event);">
                        <span class="uk-flex"><span class="material-icons" style="font-size: 20px;">close</span></span>
                      </button>
                    }
                  }
                </div>
              }
              <!-- use action-icon class in order to apply css in your icon button-->
              <ng-content select="[action]"></ng-content>
            </div>
            <div class="tools">
              <ng-content select="[tools]"></ng-content>
            </div>
          </div>
        </div>
        @if (filteredOptions().length > 0 && opened()) {
          <div class="options uk-dropdown"
            #optionBox uk-dropdown="mode: none; stretch: true; flip: false; shift: false" [attr.boundary]="'#' + id">
            <ul class="uk-nav uk-dropdown-nav" role="listbox" [attr.aria-label]="placeholderInfo().label">
              @for (option of filteredOptions(); track option; let i = $index) {
                <li [class.uk-hidden]="option.hidden"
                  [class.uk-active]="(control.value === option.value) || selectedIndex() === i">
                  <!-- Enter bubbles to the window listener, which picks the highlighted option and closes the list. -->
                  <a role="option" tabindex="-1" [attr.aria-selected]="control.value === option.value"
                    (click)="selectOption(option)" (keydown.enter)="selectedIndex.set(i)"
                    [class]="option.disabled ? 'uk-disabled uk-text-muted' : ''">
                    <span [attr.uk-tooltip]="tooltip()?('title: ' + (option.tooltip ? option.tooltip : option.label) + '; delay: 500; pos:bottom-left'):null">{{ option.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>
      @if (control.invalid && control.touched) {
        <span class="uk-text-small uk-text-danger">
          @if (control.errors?.['error']) {
            <span>{{ control.errors?.['error'] }}</span>
          }
          @if (kind() === 'URL') {
            <span>Please provide a valid URL (e.g. https://example.com)</span>
          }
        </span>
      }
    }
    <span class="uk-text-small uk-text-danger">
      <ng-content select="[error]"></ng-content>
    </span>
    <span class="uk-text-small uk-text-success">
      <ng-content select="[success]"></ng-content>
    </span>
    @if (control()?.valid) {
      <span class="uk-text-small uk-text-warning uk-margin-xsmall-top">
        <ng-content select="[warning]"></ng-content>
      </span>
    }
    <i class="uk-text-small uk-text-meta uk-margin-xsmall-top">
      <ng-content select="[note]"></ng-content>
    </i>
    `
})

export class InputComponent implements OnDestroy, AfterViewInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  private static INPUT_COUNTER = 0;
  /** Basic information */
  readonly formInput = input.required<AbstractControl | null>();
  readonly type = input<InputType>('text');
  readonly placeholder = input<string | Placeholder>('');
  readonly hint = input<string>();
  readonly valueChange = output<unknown>();
  /** Select | Autocomplete available options */
  readonly options = input<(Option | string | number | null)[] | null>(null);
  readonly selectArrow = input<string | null>('arrow_drop_down');
  readonly selectable = input(false);
  readonly noValueSelected = input('No option selected');

  readonly disabledIcon = 'lock';
  readonly id = 'input-' + (++InputComponent.INPUT_COUNTER);
  /** The element its label points to: the text box, or the search box of an open autocomplete. */
  readonly fieldId = this.id + '-field';
  readonly searchControl = new FormControl('');

  /** Every field this app shows is bound to a FormControl. */
  readonly control = computed(() => {
    const control = this.formInput();
    return control instanceof FormControl ? control : null;
  });
  readonly optionsArray = computed<Option[]>(() => (this.options() ?? []).map(option => {
    if (option === null) {
      return { label: this.noValueSelected(), value: '' };
    } else if (typeof option === 'string' || typeof option === 'number') {
      return { label: option.toString(), value: option };
    }
    return option;
  }));
  /** What is rendered: a select with more than six options becomes an autocomplete. */
  readonly kind = computed<InputType>(() =>
    this.type() === 'select' && this.optionsArray().length > InputComponent.OPTIONS_BREAKPOINT ? 'autocomplete' : this.type());
  readonly isSelectable = computed(() => this.selectable() || this.type() === 'select');
  readonly icon = computed(() => this.type() === 'select' && this.kind() === 'autocomplete' ? this.selectArrow() : null);
  readonly tooltip = computed(() => this.optionsArray().length > 0);
  /** A static placeholder is not available for an autocomplete, or when there is a hint. */
  readonly placeholderInfo = computed<Placeholder>(() => {
    const placeholder = this.placeholder();
    if (typeof placeholder === 'string') {
      return { label: placeholder, static: false };
    }
    return { ...placeholder, static: placeholder.static && !(this.kind() === 'autocomplete' || this.hint()) };
  });

  readonly filteredOptions = signal<Option[]>([]);
  readonly selectedIndex = signal(0);
  readonly required = signal(false);
  readonly focused = signal(false);
  readonly opened = signal(false);

  private readonly inputBox = viewChild<ElementRef<HTMLElement>>('inputBox');
  private readonly optionBox = viewChild<ElementRef<HTMLElement>>('optionBox');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('input');

  private static readonly OPTIONS_BREAKPOINT = 6;
  private initValue: unknown;
  private subscriptions: Subscription[] = [];

  constructor() {
    // The form this field shows changes without any event in the field: patched by its host,
    // disabled with the rest of a group, or loaded from a saved chart.
    refreshOnFormChanges(this.formInput);
  }

  arrowUp(event: Event) {
    const optionBox = this.optionBox();
    if (this.opened() && optionBox) {
      event.preventDefault();
      if (this.selectedIndex() > 0) {
        this.selectedIndex.update(index => index - 1);
        optionBox.nativeElement.scrollBy(0, -34);
      }
    }
  }

  arrowDown(event: Event) {
    const optionBox = this.optionBox();
    if (this.opened() && optionBox) {
      event.preventDefault();
      if (this.selectedIndex() < (this.filteredOptions().length - 1)) {
        this.selectedIndex.update(index => index + 1);
        optionBox.nativeElement.scrollBy(0, 34);
      }
    }
  }

  enter(event: Event) {
    if (this.opened() && this.optionBox()) {
      event.preventDefault();
      const option = this.filteredOptions()[this.selectedIndex()];
      if (option) {
        this.selectOption(option);
      }
      this.open(false);
      event.stopPropagation();
    } else {
      this.focus(false);
    }
  }

  click(event: MouseEvent) {
    // Programmatic clicks, such as the keyboard handlers' forwarded ones, are ignored.
    if (event.isTrusted) {
      this.focus(!!this.inputBox()?.nativeElement.contains(event.target as Node));
    }
  }

  esc() {
    this.focus(false);
  }

  ngAfterViewInit() {
    this.reset();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.control() && (changes['formInput'] || changes['options'])) {
      this.reset();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  reset() {
    const control = this.control();
    if (!control) {
      return;
    }
    this.unsubscribe();
    this.initValue = control.getRawValue();
    if (this.optionsArray().length > 0) {
      this.filteredOptions.set(this.filter(''));
    }
    if (this.kind() === 'autocomplete') {
      this.subscriptions.push(this.searchControl.valueChanges.subscribe(value => {
        this.filteredOptions.set(this.filter(value));
        if (this.focused()) {
          this.open(true);
          setTimeout(() => {
            const searchInput = this.searchInput();
            if (searchInput) {
              searchInput.nativeElement.focus();
              searchInput.nativeElement.value = value ?? '';
            }
          }, 0);
        }
      }));
    }
    this.required.set(!!control.validator?.({} as AbstractControl)?.['required']);
    this.subscriptions.push(control.valueChanges.subscribe(value => {
      if (control.enabled) {
        value = (value === '') ? null : value;
        if (this.initValue === value || (this.initValue === '' && value === null)) {
          control.markAsPristine();
        } else {
          control.markAsDirty();
        }
        if (value) {
          this.valueChange.emit(control.value);
        }
      }
    }));
    this.inputs().forEach(input => {
      input.nativeElement.disabled = control.disabled;
    });
  }

  unsubscribe() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  private filter(value: string | null): Option[] {
    let options = this.optionsArray().filter(option => !option.hidden);
    if (!value) {
      this.selectedIndex.set(0);
      return options;
    }
    const filterValue = value.toLowerCase();
    options = options.filter(option => option.label && option.label.toLowerCase().includes(filterValue));
    this.selectedIndex.set(Math.max(0, options.findIndex(option => option.value === this.control()?.value)));
    return options;
  }

  /** The label of the option holding this value, or the value itself. */
  getLabel(value: unknown): unknown {
    const option = this.optionsArray().find(option => this.equals(option.value, value));
    return option ? option.label : value;
  }

  getTooltip(value: unknown): unknown {
    const option = this.optionsArray().find(option => this.equals(option.value, value));
    return option ? (option.tooltip ? option.tooltip : option.label) : value;
  }

  focus(value: boolean) {
    const control = this.control();
    if (!control) {
      return;
    }
    if (this.focused()) {
      control.markAsTouched();
    }
    if (control.enabled) {
      this.focused.set(value);
      // Render the search box now, so it can take focus.
      this.cdr.detectChanges();
      if (value) {
        const firstInput = this.inputs()[0];
        if (firstInput) {
          firstInput.nativeElement.focus();
        } else {
          this.searchInput()?.nativeElement.focus();
        }
        this.open(this.selectArrow() ? !this.opened() : true);
      } else {
        this.open(false);
        this.inputs().forEach(input => input.nativeElement.blur());
        this.searchControl.setValue('');
      }
    }
  }

  open(value: boolean) {
    const control = this.control();
    this.opened.set(value && !!control?.enabled);
    // Render the option list now, so UIkit can show it.
    this.cdr.detectChanges();
    const optionBox = this.optionBox();
    if (optionBox) {
      if (this.opened()) {
        this.selectedIndex.set(Math.max(0, this.filteredOptions().findIndex(option => option.value === control?.value)));
        UIkit.dropdown(optionBox.nativeElement).show();
      } else {
        UIkit.dropdown(optionBox.nativeElement).hide();
        this.focused.set(false);
      }
    }
  }

  resetSearch(event: Event) {
    event.stopPropagation();
    this.searchControl.setValue('');
    this.focus(true);
  }

  resetValue(event: Event) {
    event.stopPropagation();
    this.control()?.setValue('');
    this.focus(true);
  }

  selectOption(option: Option) {
    const control = this.control();
    if (control?.enabled) {
      control.setValue(option.value);
    }
  }

  equals(a: unknown, b: unknown): boolean {
    return a === b || JSON.stringify(a) === JSON.stringify(b);
  }
}
