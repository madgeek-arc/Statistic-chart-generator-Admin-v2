import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn
} from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

export type InputType =
    'text'
    | 'URL'
    | 'logoURL'
    | 'autocomplete'
    | 'autocomplete_soft'
    | 'textarea'
    | 'select'
    | 'chips'
    | 'year-range'
    | 'date';

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

export interface YearRange {
  from: ControlConfiguration;
  to: ControlConfiguration;
}

export interface ControlConfiguration {
  control: string;
  placeholder: string;
}

declare var UIkit;

/**
 * Autocomplete soft allows values that are not listed in options list. In order to work as expected
 * avoid providing options with different label and value.
 *
 * */
@Component({
  selector: '[input]',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  template: `
    <div *ngIf="formControl" [id]="id">
      <div class="input-wrapper" [class.disabled]="formControl.disabled" [class.opened]="opened"
           [class.focused]="focused" [ngClass]="inputClass" [class.hint]="hint"
           [class.active]="!focused && (formAsControl?.value || selectable || type === 'date' || formAsArray?.length > 0 || getLabel(formAsControl?.value) || yearRangeActive)"
           [class.danger]="(formControl.invalid && (formControl.touched || !!searchControl?.touched)) || (!!searchControl?.invalid && !!searchControl?.touched)">
        <div #inputBox class="input-box" [class.select]="selectable || type ==='date'"
             [class.static]="placeholderInfo?.static">
          <div *ngIf="!placeholderInfo?.static && placeholderInfo?.label" class="placeholder">
            <label>{{ placeholderInfo.label }} <sup *ngIf="required">*</sup></label>
          </div>
          <div class="uk-flex" [class.uk-flex-middle]="type !== 'textarea'"
               [attr.uk-tooltip]="placeholderInfo.tooltip?('title: ' + placeholderInfo.tooltip + '; delay: 500; pos: bottom-left'):
                       ((tooltip && !focused && type !== 'chips' && type !== 'textarea' && (formControl.value || hint || placeholderInfo?.label))?
                       ('title: ' + (formControl.value ?getTooltip(formControl.value):(hint?hint:placeholderInfo?.label)) + '; delay: 500; pos: bottom-left'):null)">
            <ng-template [ngIf]="type === 'text' || type === 'URL' || type === 'logoURL'">
              <input #input class="input"
                     [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                     [type]="password?'password':'text'" [formControl]="formAsControl"
                     [class.uk-text-truncate]="!focused">
            </ng-template>
            <ng-template [ngIf]="type === 'textarea'">
              <textarea #textArea class="input"
                        [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                        [rows]="rows" [formControl]="formAsControl"></textarea>
            </ng-template>
            <ng-template [ngIf]="type === 'select'">
              <ng-container *ngIf="placeholderInfo?.static">
                <div *ngIf="!getLabel(formControl.value)"
                     class="input placeholder uk-width-expand uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ placeholderInfo.label }}
                </div>
                <div *ngIf="getLabel(formControl.value)"
                     class="input uk-width-expand uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                </div>
              </ng-container>
              <ng-container *ngIf="!placeholderInfo?.static">
                <div *ngIf="!getLabel(formControl.value)"
                     class="input uk-width-expand uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ noValueSelected }}
                </div>
                <div *ngIf="getLabel(formControl.value)"
                     class="input uk-width-expand uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                </div>
              </ng-container>
            </ng-template>
            <ng-template [ngIf]="type === 'autocomplete'">
              <input *ngIf="focused" [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                     #searchInput class="input" [formControl]="searchControl"
                     [class.uk-text-truncate]="!focused">
              <ng-container *ngIf="!focused && !selectable">
                <div *ngIf="!getLabel(formControl.value)"
                     class="input placeholder uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ placeholderInfo?.static ? placeholderInfo.label : getLabel(formAsControl.value) }}
                </div>
                <div *ngIf="getLabel(formControl.value)"
                     class="input uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ getLabel(formAsControl.value) }}
                </div>
              </ng-container>
              <ng-container *ngIf="!focused && selectable">
                <div *ngIf="!getLabel(formControl.value)" class="input uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ noValueSelected }}
                </div>
                <div *ngIf="getLabel(formControl.value)"
                     class="input uk-text-truncate"
                     [class.uk-disabled]="formControl.disabled">{{ getLabel(formControl.value) }}
                </div>
              </ng-container>
            </ng-template>
            <ng-template [ngIf]="type === 'autocomplete_soft'">
              <input #input class="input"
                     [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                     [formControl]="formAsControl" [class.uk-text-truncate]="!focused">
            </ng-template>
            <ng-template [ngIf]="type === 'chips'">
              <div class="uk-grid uk-grid-small uk-grid-row-collapse uk-overflow-auto uk-width-expand"
                   [class.uk-flex-nowrap]="noWrap" [class.uk-overflow-auto]="noWrap" uk-grid>
                <div *ngFor="let chip of formAsArray.controls; let i=index" #chip
                     [class.uk-hidden]="!focused && i > visibleChips - 1" class="chip">
                  <div class="uk-label uk-label-small uk-text-transform-none uk-flex uk-flex-middle"
                       [attr.uk-tooltip]="(tooltip)?('title: ' + getLabel(chip.value) + '; delay: 500; pos: bottom-left'):null">
                    <span class="uk-text-truncate uk-width-expand">{{ getLabel(chip.value) }}</span>
                    <span class="uk-link-text uk-margin-small-left clickable">
                      <span *ngIf="focused" class="uk-flex ng-star-inserted">
                        <span class="material-icons" style="font-size: 14px;">close</span>
                      </span>
                    </span>
                  </div>
                </div>
                <div *ngIf="searchControl && (focused || formAsArray.length === 0)" #chip
                     class="uk-width-expand search-input uk-flex uk-flex-column uk-flex-center">
                  <input #searchInput class="input" [class.search]="searchControl.value"
                         [attr.placeholder]="placeholderInfo?.static?placeholderInfo.label:hint"
                         [formControl]="searchControl" [class.uk-text-truncate]="!focused">
                </div>
                <div *ngIf="!focused && formAsArray.length > visibleChips"
                     class="uk-width-expand uk-flex uk-flex-column uk-flex-center more">
                  + {{ (formAsArray.length - visibleChips) }} more
                </div>
              </div>
            </ng-template>
            <ng-template [ngIf]="type === 'year-range' && yearRange && formAsGroup">
              <div class="uk-width-2-5">
                <input #input class="input uk-text-center uk-text-truncate"
                       [attr.placeholder]="yearRange.from.placeholder"
                       maxlength="4" (click)="activeIndex = 0;$event.preventDefault()"
                       [formControl]="getFormByName(yearRange.from.control)">
              </div>
              <div class="uk-width-1-5 uk-text-center">-</div>
              <div class="uk-width-2-5">
                <input #input class="input uk-text-center uk-text-truncate"
                       [attr.placeholder]="yearRange.to.placeholder"
                       maxlength="4" (click)="activeIndex = 1;$event.preventDefault()"
                       [formControl]="getFormByName(yearRange.to.control)">
              </div>
            </ng-template>
            <ng-template [ngIf]="type === 'date'">
              <div *ngIf="!formAsControl.getRawValue()" class="input uk-text-truncate"
                   [class.uk-disabled]="formControl.disabled">{{ selectADate }}
              </div>
              <div *ngIf="formAsControl.getRawValue()" class="input uk-text-truncate"
                   [class.uk-disabled]="formControl.disabled">{{ formAsControl.getRawValue() | date: 'dd-MM-yyyy' }}
              </div>
            </ng-template>
            <div
              *ngIf="(formControl.disabled && disabledIcon) || icon || (selectable && selectArrow) || type === 'autocomplete' || searchable || type === 'date'"
              class="uk-margin-small-left icon">
              <span *ngIf="formControl.disabled && disabledIcon" class="uk-flex">
                <span class="material-icons" style="font-size: 20px;">{{ disabledIcon }}</span>
              </span>
              <ng-template [ngIf]="formControl.enabled">
                <span *ngIf="!searchControl?.value && icon" class="uk-flex">
                  <span class="material-icons" style="font-size: 20px;">{{ icon }}</span>
                </span>
                <span *ngIf="!icon && selectable && selectArrow" class="uk-flex">
                  <span class="material-icons" style="font-size: 20px;">{{ selectArrow }}</span>
                </span>
                <button *ngIf="focused && type === 'autocomplete' && (!selectable || searchControl.value)"
                        class="uk-close uk-icon" (click)="resetSearch($event)">
                  <span class="uk-flex"><span class="material-icons" style="font-size: 20px;">close</span></span>
                </button>
                <button *ngIf="(!focused && type === 'autocomplete' && !selectable) ||
                              (type !== 'autocomplete' && !searchControl?.value && !!formControl?.value && (searchable || !selectable)) ||
                              (type === 'date' && formAsControl?.value)"
                        class="uk-close uk-icon" (click)="resetValue($event);">
                  <span class="uk-flex"><span class="material-icons" style="font-size: 20px;">close</span></span>
                </button>
              </ng-template>
            </div>
            <!-- use action-icon class in order to apply css in your icon button-->
            <ng-content select="[action]"></ng-content>
          </div>
          <div class="tools">
            <ng-content select="[tools]"></ng-content>
          </div>
        </div>
      </div>
      <div *ngIf="type === 'date' && opened" class="uk-dropdown" #calendarBox
           uk-dropdown="pos: bottom-left; mode: none; flip: false ; shift: false" [attr.target]="'#' + id"
           [attr.boundary]="'#' + id" (click)="$event.stopPropagation()">
        <mat-calendar [selected]="selectedDate" [startAt]="selectedDate"
                      (selectedChange)="dateChanged($event)"></mat-calendar>
      </div>
      <div *ngIf="filteredOptions && filteredOptions.length > 0 && opened" class="options uk-dropdown"
           #optionBox uk-dropdown="mode: none; stretch: true; flip: false; shift: false" [attr.boundary]="'#' + id">
        <ul class="uk-nav uk-dropdown-nav">
          <li *ngFor="let option of filteredOptions; let i=index" [class.uk-hidden]="option.hidden"
              [class.uk-active]="(formControl.value === option.value) || selectedIndex === i">
            <a (click)="selectOption(option, $event)" [class]="option.disabled ? 'uk-disabled uk-text-muted' : ''">
              <span [attr.uk-tooltip]="(tooltip)?('title: ' + (option.tooltip ? option.tooltip : option.label) + '; delay: 500; pos:bottom-left'):null">{{ option.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <span *ngIf="formControl?.invalid && formControl?.touched" class="uk-text-small uk-text-danger">
      <span *ngIf="errors?.error">{{ errors?.error }}</span>
      <span *ngIf="type === 'URL' || type === 'logoURL'">Please provide a valid URL (e.g. https://example.com)</span>
    </span>
    <span class="uk-text-small uk-text-danger">
      <ng-content select="[error]"></ng-content>
    </span>
    <span class="uk-text-small uk-text-success">
      <ng-content select="[success]"></ng-content>
    </span>
    <span *ngIf="formControl?.valid" class="uk-text-small uk-text-warning uk-margin-xsmall-top">
      <ng-content select="[warning]"></ng-content>
      <span *ngIf="!secure">
        <span class="uk-text-bold">Note:</span> Prefer urls like "<span class="uk-text-bold">https://</span>example.com/my-secure-image.png"
            instead of "<span class="uk-text-bold">http://</span>example.com/my-image.png".
            <span class="uk-text-bold">Browsers may not load non secure content.</span>
      </span>
    </span>
    <i class="uk-text-small uk-text-meta uk-margin-xsmall-top">
      <ng-content select="[note]"></ng-content>
    </i>
  `
})

export class InputComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private static INPUT_COUNTER = 0;
  /** Basic information */
  @Input('formInput') formControl: AbstractControl;
  @Input('type') type: InputType = 'text';
  @Input() password = false;
  @Input() validators: ValidatorFn[] | ValidatorFn;
  @Input() disabled = false;
  @Input() disabledIcon = 'lock';
  @Input() value: any | any[];
  @Output() valueChange = new EventEmitter<any | any[]>();
  @Input() hint: string;
  @Input() tooltip = false;
  @Input() searchable = false;
  /** Text */
  @ViewChildren('input') input: QueryList<ElementRef>;
  /** Textarea options */
  @ViewChild('textArea') textArea: ElementRef;
  @Input('rows') rows = 3;
  /** Select | Autocomplete | chips available options */
  @Input() selectArrow = 'arrow_drop_down';
  @Input() selectedIndex = 0;
  @Input() selectable = false;
  @Input() noValueSelected = 'No option selected';
  /** Chips && Autocomplete*/
  public filteredOptions: Option[] = [];
  public searchControl: UntypedFormControl;
  public activeElement: BehaviorSubject<ElementRef> = new BehaviorSubject<ElementRef>(null);
  /** Use modifier's class(es) to change view of your Input */
  @Input() inputClass = 'flat';
  /** Icon on the input */
  @Input() icon: string = null;
  /** Chip options */
  @Input() addExtraChips = false;
  @Input() showOptionsOnEmpty = true;
  @Input() visibleChips = 1;
  @Input() separators: string[] = [];
  @Input() noWrap = false;
  /** Year Range Configuration */
  @Input() yearRange: YearRange;
  public activeIndex: 0 | 1 | null = null;
  /** Date Configuration*/
  @Input() selectADate = 'Select a date';
  @Input() formatDateToString = false;
  public selectedDate: Date;
  @Input() visibleRows = -1;
  @Input() extendEnter: () => void = null;
  @Output() focusEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** LogoUrl information */
  public secure = true;
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
  @ViewChild('calendarBox') calendarBox: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren('chip') chips: QueryList<ElementRef>;
  @ViewChild('datepicker') datepicker: MatDatepicker<any>;

  @Input()
  set placeholder(placeholder: string | Placeholder) {
    if (this.type === 'year-range') {
      this.placeholderInfo = null;
    } else if (typeof placeholder === 'string') {
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
            label: this.noValueSelected,
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
        this.showOptionsOnEmpty = true;
        this.icon = this.selectArrow;
      }
      this.selectable = true;
    }
  }

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:keydown.arrowUp', ['$event'])
  arrowUp(event: KeyboardEvent) {
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.optionBox.nativeElement.scrollBy(0, -34);
      }
    }
  }

  @HostListener('window:keydown.arrowDown', ['$event'])
  arrowDown(event: KeyboardEvent) {
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.selectedIndex < (this.filteredOptions.length - 1)) {
        this.selectedIndex++;
        this.optionBox.nativeElement.scrollBy(0, 34);
      }
    }
  }

  @HostListener('window:keydown.arrowLeft', ['$event'])
  arrowLeft(event: KeyboardEvent) {
    if (this.type === 'chips' && this.focused) {
      if (this.activeElement.getValue()) {
        event.preventDefault();
        const index = this.chips.toArray().indexOf(this.activeElement.getValue());
        if (index > 0) {
          this.activeElement.next(this.chips.get(index - 1));
          return;
        }
      }
    }
  }

  @HostListener('window:keydown.arrowRight', ['$event'])
  arrowRight(event: KeyboardEvent) {
    if (this.type === 'chips' && this.focused) {
      if (this.activeElement.getValue()) {
        event.preventDefault();
        const index = this.chips.toArray().indexOf(this.activeElement.getValue());
        if (index < this.chips.length - 1) {
          this.activeElement.next(this.chips.get(index + 1));
          return;
        }
      }
    }
  }

  @HostListener('window:keydown.enter', ['$event'])
  enter(event: KeyboardEvent) {
    if (this.extendEnter) {
      this.extendEnter();
    }
    if (this.opened && this.optionBox) {
      event.preventDefault();
      if (this.filteredOptions[this.selectedIndex]) {
        this.selectOption(this.filteredOptions[this.selectedIndex], event);
      }
      this.open(false);
      event.stopPropagation();
    } else {
      this.focus(false, event);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.separators.includes(event.key) || this.separators.includes(event.key.toLowerCase())) {
      event.preventDefault();
      this.add(event, true);
    }
  }

  @HostListener('document:click', ['$event'])
  click(event: any) {
    if (event.isTrusted) {
      this.focus(this.inputBox && this.inputBox.nativeElement.contains(event.target));
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  esc(event: KeyboardEvent) {
    this.focus(false);
  }

  ngOnInit() {
    InputComponent.INPUT_COUNTER++;
    this.id = 'input-' + InputComponent.INPUT_COUNTER;
    if (!this.formControl) {
      if (Array.isArray(this.value)) {
        this.formControl = new UntypedFormArray([]);
        this.value.forEach(value => {
          this.formAsArray.push(new UntypedFormControl(value, this.validators));
        });
      } else {
        this.formControl = new UntypedFormControl(this.value, this.validators);
      }
      if (this.disabled) {
        this.formControl.disable();
      }
    }
    this.activeElement.subscribe(element => {
      if (element) {
        element.nativeElement.scrollIntoView({behavior: 'smooth'});
      }
    });
  }

  ngAfterViewInit() {
    this.reset();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.formControl) {
      if (changes['value'] && changes['value'].currentValue !== changes['value'].previousValue) {
        this.formControl.setValue(this.value);
      }
      if (changes['validators']) {
        this.updateValidators();
      }
      if (changes['formControl'] || changes['validators'] || changes['options']) {
        this.reset();
      }
      if (changes['disabled']) {
        if (this.disabled) {
          this.formControl.disable();
        } else {
          this.formControl.enable();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  getFormByName(name: string): UntypedFormControl {
    if (this.formControl instanceof UntypedFormGroup) {
      return <UntypedFormControl>this.formControl.get(name);
    } else {
      return null;
    }
  }

  get formAsGroup(): UntypedFormGroup {
    if (this.formControl instanceof UntypedFormGroup) {
      return this.formControl;
    } else {
      return null;
    }
  }

  get formAsControl(): UntypedFormControl {
    if (this.formControl instanceof UntypedFormControl) {
      return this.formControl;
    } else {
      return null;
    }
  }

  get formAsArray(): UntypedFormArray {
    if (this.formControl instanceof UntypedFormArray) {
      return this.formControl;
    } else {
      return null;
    }
  }

  get yearRangeActive(): boolean {
    if (this.yearRange) {
      return this.formAsGroup && (this.getFormByName(this.yearRange.from.control)?.value || this.getFormByName(this.yearRange.to.control)?.value);
    }
    return false;
  }

  get errors(): any {
    if (this.formAsGroup) {
      return (this.formAsGroup.errors
          ? this.formAsGroup.errors : (this.getFormByName(this.yearRange.from.control).errors
              ? this.getFormByName(this.yearRange.from.control).errors : this.getFormByName(this.yearRange.to.control).errors));
    } else if (this.formAsControl) {
      return this.formAsControl.errors;
    } else if (this.searchControl) {
      return this.searchControl.errors;
    } else {
      return null;
    }
  }

  reset() {
    this.secure = true;
    this.unsubscribe();
    this.initValue = this.formControl.getRawValue();
    if (this.type === 'logoURL') {
      this.secure = (!this.initValue || this.initValue.includes('https://'));
    }
    if (this.optionsArray?.length > 0) {
      this.filteredOptions = this.filter('');
      this.cdr.detectChanges();
    }
    if (this.type === 'chips' || this.type === 'autocomplete') {
      if (!this.searchControl) {
        this.searchControl = new UntypedFormControl('', this.validators);
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
    if (this.formAsControl?.validator || this.formAsArray?.validator) {
      const validator = this.formControl.validator({} as AbstractControl);
      this.required = (validator && validator['required']);
    }
    if (this.type === 'date') {
      this.selectedDate = this.formAsControl.getRawValue() ? new Date(this.formAsControl.getRawValue()) : null;
    }
    this.subscriptions.push(this.formControl.valueChanges.subscribe(value => {
      if (this.formControl.enabled) {
        if (this.type !== 'year-range') {
          value = (value === '') ? null : value;
          if (this.type === 'logoURL') {
            this.secure = (!value || value.includes('https://'));
          }
          if (this.initValue === value || (this.initValue === '' && value === null)) {
            this.formControl.markAsPristine();
          } else {
            this.formControl.markAsDirty();
          }
          if (this.type === 'autocomplete_soft') {
            this.filteredOptions = this.filter(value);
            this.cdr.detectChanges();
            if (this.focused) {
              this.open(true);
            }
          }
          if (this.type === 'date') {
            this.selectedDate = value ? new Date(value) : null;
          }
        }
        if ((this.value && value && this.value !== value) || (!this.value && value) || this.value && !value) {
          this.valueChange.emit(this.formControl.value);
        }
      }
    }));
    if (this.formAsGroup) {
      const fromControl = this.formAsGroup.get(this.yearRange.from.control);
      this.subscriptions.push(fromControl.valueChanges.subscribe(value => {
        const from = this.initValue[this.yearRange.from.control];
        if (from === value || (from === '' && value === null)) {
          fromControl.markAsPristine();
        } else {
          fromControl.markAsDirty();
        }
        if (fromControl.valid) {
          if (this.activeIndex === 0 && value) {
            this.activeIndex = 1;
            this.input.get(this.activeIndex).nativeElement.focus();
          }
        }
      }));
      const toControl = this.formAsGroup.get(this.yearRange.to.control);
      this.subscriptions.push(toControl.valueChanges.subscribe(value => {
        const to = this.initValue[this.yearRange.to.control];
        if (to === value || (to === '' && value === null)) {
          toControl.markAsPristine();
        } else {
          toControl.markAsDirty();
        }
      }));
    }
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

  updateValidators() {
    if (this.formAsArray) {
      this.formAsArray.controls.forEach(control => {
        control.setValidators(this.validators);
        control.updateValueAndValidity();
      });
    } else {
      this.formControl.setValidators(this.validators);
      this.formControl.updateValueAndValidity();
    }
  }

  remove(index: number, event) {
    if (this.focused) {
      this.formAsArray.removeAt(index);
      this.formAsArray.markAsDirty();
      this.focus(true);
      this.searchControl.setValue('');
      event.stopPropagation();
    }
  }

  private filter(value: string): Option[] {
    let options = this.optionsArray.filter(option => !option.hidden);
    if (this.type === 'chips') {
      options = options.filter(option => !this.formAsArray.value.find(value => this.equals(option.value, value)));
    }
    if ((!value || value.length == 0)) {
      this.selectedIndex = 0;
      return (this.showOptionsOnEmpty) ? options : [];
    }
    const filterValue = value.toString().toLowerCase();
    options = options.filter(option => (option.label && option.label.toLowerCase().indexOf(filterValue) != -1));
    this.selectedIndex = options.findIndex(option => option.value === this.formControl.value);
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    }
    return options;
  }

  add(event, addChips = false) {
    if (addChips && this.searchControl.value) {
      this.splitSearchControl();
    } else if (!this.focused) {
      this.searchControl.setValue('');
    }
  }

  splitSearchControl() {
    let values = [this.searchControl.value];
    this.separators.forEach(separator => {
      values = ([] as string[]).concat(...values.map(value => {
        if (Array.isArray(value)) {
          return ([] as string[]).concat(...value.map(element => element.split(separator)));
        } else {
          return value.split(separator);
        }
      }));
    });
    values.forEach(value => {
      const control = new UntypedFormControl(value.trim(), this.validators);
      if (control.valid) {
        this.formAsArray.push(control);
        this.formAsArray.markAsDirty();
      }
    });
    if (this.formAsArray.dirty) {
      this.activeElement.next(this.chips.last);
      this.searchControl.setValue('');
    }
  }

  getLabel(value: any): string {
    const option = this.optionsArray.find(option => this.equals(option.value, value));
    return (option) ? option.label : (value);
  }

  getTooltip(value: any): string {
    const option = this.optionsArray.find(option => this.equals(option.value, value));
    return (option) ? (option.tooltip ? option.tooltip : option.label) : (value);
  }

  focus(value: boolean, event = null) {
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
        } else if (this.textArea) {
          this.textArea.nativeElement.focus();
        } else if (this.searchInput) {
          this.searchInput.nativeElement.focus();
          this.activeElement.next(this.chips.last);
        }
        if (this.selectArrow || this.datepicker) {
          this.open(!this.opened);
        } else if (this.type !== 'autocomplete' || this.showOptionsOnEmpty || !this.formControl.value) {
          this.open(true);
        }
      } else {
        this.activeIndex = null;
        this.open(false);
        if (this.input) {
          this.input.forEach(input => {
            input.nativeElement.blur();
          });
        } else if (this.textArea) {
          this.textArea.nativeElement.blur();
        } else if (this.searchInput) {
          this.searchInput.nativeElement.blur();
        }
        if (this.searchControl) {
          this.add(event, this.addExtraChips);
        }
      }
      this.focusEmitter.emit(this.focused);
    }
  }

  open(value: boolean) {
    this.opened = value && this.formControl.enabled;
    this.cdr.detectChanges();
    if (this.optionBox) {
      if (this.opened) {
        this.selectedIndex = this.filteredOptions.findIndex(option => option.value === this.formControl.value);
        if (this.selectedIndex === -1 && this.type !== 'autocomplete_soft') {
          this.selectedIndex = 0;
        }
        UIkit.dropdown(this.optionBox.nativeElement).show();
      } else {
        UIkit.dropdown(this.optionBox.nativeElement).hide();
        this.focused = false;
      }
    } else if (this.calendarBox) {
      if (this.opened) {
        UIkit.dropdown(this.calendarBox.nativeElement).show();
      } else {
        UIkit.dropdown(this.calendarBox.nativeElement).hide();
        this.focused = false;
      }
    }
  }

  resetSearch(event: any) {
    event.stopPropagation();
    this.searchControl.setValue('');
    this.focus(true, event);
  }

  resetValue(event: any) {
    event.stopPropagation();
    this.formControl.setValue('');
    this.focus(true, event);
  }

  selectOption(option: Option, event) {
    if (this.formControl.enabled) {
      if (this.formAsControl) {
        this.formAsControl.setValue(option.value);
      } else if (this.formAsArray) {
        this.formAsArray.push(new UntypedFormControl(option.value));
        this.formAsArray.markAsDirty();
        event.stopPropagation();
        this.focus(true);
        this.searchControl.setValue('');
      }
    }
  }

  dateChanged(event: Date) {
    this.focus(false);
    if (this.formatDateToString) {
      this.formAsControl.setValue(event.toISOString().split('T')[0]);
      return;
    }
    this.formAsControl.setValue(event.getTime());
  }

  equals(a: any, b: any): boolean {
    return a === b || JSON.stringify(a) === JSON.stringify(b);
  }
}
