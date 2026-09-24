import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  inject,
  input,
  output
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

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
  value: any;
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

declare let UIkit: any;

/**
 * Adapted from OpenAIRE's shared input, keeping only the field types this app uses.
 */
@Component({
    selector: '[input]',
    host: {
        '(window:keydown.arrowUp)': 'arrowUp($event)',
        '(window:keydown.arrowDown)': 'arrowDown($event)',
        '(window:keydown.enter)': 'enter($event)',
        '(document:click)': 'click($event)',
        '(window:keydown.escape)': 'esc($event)'
    },
    imports: [NgClass, ReactiveFormsModule],
    template: `
    @if (formControl) {
      <div [id]="id">
        <div class="input-wrapper" [class.disabled]="formControl.disabled" [class.opened]="opened"
          [class.focused]="focused" [ngClass]="inputClass()" [class.hint]="hint"
          [class.active]="!focused && (formAsControl?.value || formAsControl?.value === 0 || selectable || getLabel(formAsControl?.value))"
          [class.danger]="(formControl.invalid && (formControl.touched || !!searchControl?.touched)) || (!!searchControl?.invalid && !!searchControl?.touched)">
          <div #inputBox class="input-box" [class.select]="selectable"
            [class.static]="placeholderInfo?.static">
            @if (!placeholderInfo?.static && placeholderInfo?.label) {
              <div class="placeholder">
                <label>{{ placeholderInfo.label }} @if (required) {
                  <sup>*</sup>
                }</label>
              </div>
            }
            <div class="uk-flex uk-flex-middle"
               [attr.uk-tooltip]="placeholderInfo.tooltip?('title: ' + placeholderInfo.tooltip + '; delay: 500; pos: bottom-left'):
                       ((tooltip && !focused && (formControl.value || hint || placeholderInfo?.label))?
                       ('title: ' + (formControl.value ?getTooltip(formControl.value):(hint?hint:placeholderInfo?.label)) + '; delay: 500; pos: bottom-left'):null)">
              @if (type === 'text' || type === 'URL') {
                <input #input class="input"
                  [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                  type="text" [formControl]="formAsControl"
                  [class.uk-text-truncate]="!focused">
              }
              @if (type === 'number') {
                <input #input class="input" type="number"
                  [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                  [formControl]="formAsControl"
                  [class.uk-text-truncate]="!focused">
              }
              @if (type === 'color') {
                <input #input class="input" type="color"
                  [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                  [formControl]="formAsControl"
                  [class.uk-text-truncate]="!focused">
              }
              @if (type === 'select') {
                @if (placeholderInfo?.static) {
                  @if (!getLabel(formControl.value)) {
                    <div
                      class="input placeholder uk-width-expand uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ placeholderInfo.label }}
                    </div>
                  }
                  @if (getLabel(formControl.value)) {
                    <div
                      class="input uk-width-expand uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                    </div>
                  }
                }
                @if (!placeholderInfo?.static) {
                  @if (!getLabel(formControl.value)) {
                    <div
                      class="input uk-width-expand uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ noValueSelected() }}
                    </div>
                  }
                  @if (getLabel(formControl.value)) {
                    <div
                      class="input uk-width-expand uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                    </div>
                  }
                }
              }
              @if (type === 'autocomplete') {
                @if (focused) {
                  <input [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                    #searchInput class="input" [formControl]="searchControl"
                    [class.uk-text-truncate]="!focused">
                }
                @if (!focused && !selectable) {
                  @if (!getLabel(formControl.value)) {
                    <div
                      class="input placeholder uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ placeholderInfo?.static ? placeholderInfo.label : getLabel(formAsControl.value) }}
                    </div>
                  }
                  @if (getLabel(formControl.value)) {
                    <div
                      class="input uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ getLabel(formAsControl.value) }}
                    </div>
                  }
                }
                @if (!focused && selectable) {
                  @if (!getLabel(formControl.value)) {
                    <div class="input uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ noValueSelected() }}
                    </div>
                  }
                  @if (getLabel(formControl.value)) {
                    <div
                      class="input uk-text-truncate"
                      [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                    </div>
                  }
                }
              }
              @if ((formControl.disabled && disabledIcon) || icon || (selectable && selectArrow) || type === 'autocomplete') {
                <div
                  class="uk-margin-small-left icon">
                  @if (formControl.disabled && disabledIcon) {
                    <span class="uk-flex">
                      <span class="material-icons" style="font-size: 20px;">{{ disabledIcon }}</span>
                    </span>
                  }
                  @if (formControl.enabled) {
                    @if (!searchControl?.value && icon) {
                      <span class="uk-flex">
                        <span class="material-icons" style="font-size: 20px;">{{ icon }}</span>
                      </span>
                    }
                    @if (!icon && selectable && selectArrow) {
                      <span class="uk-flex">
                        <span class="material-icons" style="font-size: 20px;">{{ selectArrow }}</span>
                      </span>
                    }
                    @if (focused && type === 'autocomplete' && (!selectable || searchControl.value)) {
                      <button
                        class="uk-close uk-icon" (click)="resetSearch($event)">
                        <span class="uk-flex"><span class="material-icons" style="font-size: 20px;">close</span></span>
                      </button>
                    }
                    @if ((!focused && type === 'autocomplete' && !selectable) ||
                      (type !== 'autocomplete' && !searchControl?.value && !!formControl?.value && !selectable)) {
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
        @if (filteredOptions && filteredOptions.length > 0 && opened) {
          <div class="options uk-dropdown"
            #optionBox uk-dropdown="mode: none; stretch: true; flip: false; shift: false" [attr.boundary]="'#' + id">
            <ul class="uk-nav uk-dropdown-nav">
              @for (option of filteredOptions; track option; let i = $index) {
                <li [class.uk-hidden]="option.hidden"
                  [class.uk-active]="(formControl.value === option.value) || selectedIndex === i">
                  <a (click)="selectOption(option, $event)" [class]="option.disabled ? 'uk-disabled uk-text-muted' : ''">
                    <span [attr.uk-tooltip]="(tooltip)?('title: ' + (option.tooltip ? option.tooltip : option.label) + '; delay: 500; pos:bottom-left'):null">{{ option.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    }
    @if (formControl?.invalid && formControl?.touched) {
      <span class="uk-text-small uk-text-danger">
        @if (errors?.error) {
          <span>{{ errors?.error }}</span>
        }
        @if (type === 'URL') {
          <span>Please provide a valid URL (e.g. https://example.com)</span>
        }
      </span>
    }
    <span class="uk-text-small uk-text-danger">
      <ng-content select="[error]"></ng-content>
    </span>
    <span class="uk-text-small uk-text-success">
      <ng-content select="[success]"></ng-content>
    </span>
    @if (formControl?.valid) {
      <span class="uk-text-small uk-text-warning uk-margin-xsmall-top">
        <ng-content select="[warning]"></ng-content>
      </span>
    }
    <i class="uk-text-small uk-text-meta uk-margin-xsmall-top">
      <ng-content select="[note]"></ng-content>
    </i>
    `
})

export class InputComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  private static INPUT_COUNTER = 0;
  /** Basic information */
  @Input('formInput') formControl: AbstractControl;
  @Input() type: InputType = 'text';
  @Input() disabledIcon = 'lock';
  readonly valueChange = output<any>();
  @Input() hint: string;
  @Input() tooltip = false;
  /** Text */
  @ViewChildren('input') input: QueryList<ElementRef>;
  /** Select | Autocomplete available options */
  @Input() selectArrow = 'arrow_drop_down';
  @Input() selectedIndex = 0;
  @Input() selectable = false;
  readonly noValueSelected = input('No option selected');
  /** Autocomplete */
  public filteredOptions: Option[] = [];
  public searchControl: UntypedFormControl;
  /** Use modifier's class(es) to change view of your Input */
  readonly inputClass = input('flat');
  /** Icon on the input */
  @Input() icon: string = null;
  public activeIndex: 0 | 1 | null = null;
  /** Internal basic information */
  public id: string;
  public placeholderInfo: Placeholder = {label: '', static: true};
  public required = false;
  public focused = false;
  public opened = false;
  private initValue: any;
  private optionsArray: Option[] = [];
  private optionsBreakpoint = 6;
  private subscriptions: any[] = [];
  @ViewChild('inputBox') inputBox: ElementRef;
  @ViewChild('optionBox') optionBox: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  @Input()
  set placeholder(placeholder: string | Placeholder) {
    if (typeof placeholder === 'string') {
      this.placeholderInfo = {label: placeholder, static: false};
    } else {
      if (placeholder.static && (this.type === 'autocomplete' || this.hint)) {
        placeholder.static = false;
        console.debug('Static placeholder is not available in this type of input and if hint is available.');
      }
      this.placeholderInfo = placeholder;
    }
  }

  @Input()
  set options(options: (Option | string | number) []) {
    if (options) {
      this.optionsArray = options.map(option => {
        if (option === null) {
          return {
            label: this.noValueSelected(),
            value: ''
          };
        } else if (typeof option === 'string' || typeof option === 'number') {
          return {
            label: option.toString(),
            value: option
          };
        } else {
          return option;
        }
      });
    } else {
      this.optionsArray = [];
    }
    if (!this.tooltip) {
      this.tooltip = this.optionsArray.length > 0;
    }
    if (this.type === 'select') {
      if (this.optionsArray.length > this.optionsBreakpoint) {
        this.type = 'autocomplete';
        this.icon = this.selectArrow;
      }
      this.selectable = true;
    }
  }

  arrowUp(event: Event) {
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.optionBox.nativeElement.scrollBy(0, -34);
      }
    }
  }

  arrowDown(event: Event) {
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.selectedIndex < (this.filteredOptions.length - 1)) {
        this.selectedIndex++;
        this.optionBox.nativeElement.scrollBy(0, 34);
      }
    }
  }

  enter(event: Event) {
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.filteredOptions[this.selectedIndex]) {
        this.selectOption(this.filteredOptions[this.selectedIndex], event);
      }
      this.open(false);
      event.stopPropagation();
    } else {
      this.focus(false);
    }
  }

  click(event: any) {
    if (event.isTrusted) {
      this.focus(this.inputBox && this.inputBox.nativeElement.contains(event.target));
    }
  }

  esc(_event: Event) {
    this.focus(false);
  }

  ngOnInit() {
    InputComponent.INPUT_COUNTER++;
    this.id = 'input-' + InputComponent.INPUT_COUNTER;
  }

  ngAfterViewInit() {
    this.reset();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.formControl) {
      if (changes['formControl'] || changes['options']) {
        this.reset();
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  get formAsControl(): UntypedFormControl {
    if (this.formControl instanceof UntypedFormControl) {
      return this.formControl;
    } else {
      return null;
    }
  }

  get errors(): any {
    if (this.formAsControl) {
      return this.formAsControl.errors;
    } else if (this.searchControl) {
      return this.searchControl.errors;
    } else {
      return null;
    }
  }

  reset() {
    this.unsubscribe();
    this.initValue = this.formControl.getRawValue();
    if (this.optionsArray?.length > 0) {
      this.filteredOptions = this.filter('');
      this.cdr.detectChanges();
    }
    if (this.type === 'autocomplete') {
      if (!this.searchControl) {
        this.searchControl = new UntypedFormControl('');
      }
      this.subscriptions.push(this.searchControl.valueChanges.subscribe(value => {
        this.filteredOptions = this.filter(value);
        this.cdr.detectChanges();
        if (this.focused) {
          this.open(true);
          setTimeout(() => {
            if (this.searchInput) {
              this.searchInput.nativeElement.focus();
              this.searchInput.nativeElement.value = value;
            }
          }, 0);
        }
      }));
    }
    if (this.formAsControl?.validator) {
      const validator = this.formControl.validator({} as AbstractControl);
      this.required = (validator && validator['required']);
    }
    this.subscriptions.push(this.formControl.valueChanges.subscribe(value => {
      if (this.formControl.enabled) {
        value = (value === '') ? null : value;
        if (this.initValue === value || (this.initValue === '' && value === null)) {
          this.formControl.markAsPristine();
        } else {
          this.formControl.markAsDirty();
        }
        if (value) {
          this.valueChange.emit(this.formControl.value);
        }
      }
    }));
    if (this.input) {
      this.input.forEach(input => {
        input.nativeElement.disabled = this.formControl.disabled;
      });
    }
  }

  unsubscribe() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscription) {
        subscription.unsubscribe();
      }
    });
  }

  private filter(value: string): Option[] {
    let options = this.optionsArray.filter(option => !option.hidden);
    if ((!value || value.length == 0)) {
      this.selectedIndex = 0;
      return options;
    }
    const filterValue = value.toString().toLowerCase();
    options = options.filter(option => (option.label && option.label.toLowerCase().indexOf(filterValue) != -1));
    this.selectedIndex = options.findIndex(option => option.value === this.formControl.value);
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    }
    return options;
  }

  getLabel(value: any): string {
    const option = this.optionsArray.find(option => this.equals(option.value, value));
    return (option) ? option.label : (value);
  }

  getTooltip(value: any): string {
    const option = this.optionsArray.find(option => this.equals(option.value, value));
    return (option) ? (option.tooltip ? option.tooltip : option.label) : (value);
  }

  focus(value: boolean) {
    if (!this.activeIndex) {
      this.activeIndex = 0;
    }
    if (this.focused) {
      this.formControl.markAsTouched();
    }
    if (this.formControl.enabled) {
      this.focused = value;
      this.cdr.detectChanges();
      if (this.focused) {
        if (this.input?.length > 0) {
          this.input.get(this.activeIndex).nativeElement.focus();
        } else if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
        if (this.selectArrow) {
          this.open(!this.opened);
        } else {
          this.open(true);
        }
      } else {
        this.activeIndex = null;
        this.open(false);
        if (this.input) {
          this.input.forEach(input => {
            input.nativeElement.blur();
          });
        } else if (this.searchInput) {
          this.searchInput.nativeElement.blur();
        }
        if (this.searchControl) {
          this.searchControl.setValue('');
        }
      }
    }
  }

  open(value: boolean) {
    this.opened = value && this.formControl.enabled;
    this.cdr.detectChanges();
    if (this.optionBox) {
      if (this.opened) {
        this.selectedIndex = this.filteredOptions.findIndex(option => option.value === this.formControl.value);
        if (this.selectedIndex === -1) {
          this.selectedIndex = 0;
        }
        UIkit.dropdown(this.optionBox.nativeElement).show();
      } else {
        UIkit.dropdown(this.optionBox.nativeElement).hide();
        this.focused = false;
      }
    }
  }

  resetSearch(event: any) {
    event.stopPropagation();
    this.searchControl.setValue('');
    this.focus(true);
  }

  resetValue(event: any) {
    event.stopPropagation();
    this.formControl.setValue('');
    this.focus(true);
  }

  selectOption(option: Option, _event: any) {
    if (this.formControl.enabled && this.formAsControl) {
      this.formAsControl.setValue(option.value);
    }
  }

  equals(a: any, b: any): boolean {
    return a === b || JSON.stringify(a) === JSON.stringify(b);
  }
}
