import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { InputComponent, Option } from './input.component';
import { DynamicFormHandlingService } from '../services/dynamic-form-handling-service/dynamic-form-handling.service';

// The field types the dashboard uses, bound the way its templates bind them: always through
// [formInput], with the host owning the form.
@Component({
  template: `
    <div class="t-name" input placeholder="Name" [formInput]="form.get('name')"></div>
    <div class="t-title" input placeholder="Title" hint="Chart title" [formInput]="form.get('title')"></div>
    <div class="t-size" input placeholder="Size" type="number" [formInput]="form.get('size')"></div>
    <div class="t-color" input placeholder="Color" type="color" [selectable]="true" [selectArrow]="null"
         [formInput]="form.get('color')"></div>
    <div class="t-url" input placeholder="Image URL" type="URL" [formInput]="form.get('url')"></div>
    <div class="t-agg" input placeholder="Aggregate" type="select" [formInput]="form.get('agg')" [options]="aggregates"></div>
    <div class="t-stack" input placeholder="Stacked" type="select" [noValueSelected]="'Select One'"
         [formInput]="form.get('stack')" [options]="stacking"></div>
    <div class="t-entity" input placeholder="Entity" type="select" [formInput]="form.get('entity')" [options]="entities"></div>
    <div class="t-lib" input placeholder="Library" type="select" [formInput]="form.get('library')" [options]="libraries"
         (valueChange)="libraryChanges.push($event)"></div>
  `,
  imports: [InputComponent]
})
class DashboardLikeHostComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    title: new FormControl(''),
    size: new FormControl<number | null>(null),
    color: new FormControl('#ff0000'),
    url: new FormControl('', Validators.pattern(/^https?:\/\//)),
    agg: new FormControl<string | null>(null),
    stack: new FormControl<string | null>(null),
    entity: new FormControl<string | null>(null),
    library: new FormControl<string | null>(null)
  });
  aggregates: Option[] = [
    { label: 'Total', value: 'total' }, { label: 'Count', value: 'count' }, { label: 'Sum', value: 'sum' },
    { label: 'Minimum', value: 'min' }, { label: 'Maximum', value: 'max' }, { label: 'Average', value: 'avg' }
  ];
  stacking: Option[] = [
    { label: 'Disabled', value: 'null' }, { label: 'Stacked by Value', value: 'normal' },
    { label: 'Stacked by Percentage', value: 'percent' }
  ];
  entities: string[] = [];
  libraries: Option[] = [{ label: 'Highcharts', value: 'HighCharts' }, { label: 'Google Charts', value: 'GoogleCharts' }];
  libraryChanges: unknown[] = [];
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<DashboardLikeHostComponent>;
  let host: DashboardLikeHostComponent;

  beforeEach(() => {
    // Tests run without UIkit's script; the component only shows and hides its dropdowns with it.
    Object.assign(window, { UIkit: { dropdown: () => ({ show: (): void => undefined, hide: (): void => undefined }) } });
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(DashboardLikeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const field = (name: string): HTMLElement => fixture.nativeElement.querySelector('.t-' + name);
  const wrapper = (name: string): HTMLElement => field(name).querySelector('.input-wrapper')!;
  const component = (name: string): InputComponent =>
    fixture.debugElement.query(By.css('.t-' + name)).injector.get(InputComponent);
  const shown = (name: string): string => field(name).querySelector('.input-box')!.textContent!.replace(/\s+/g, ' ').trim();
  const optionLabels = (name: string): string[] =>
    [...field(name).querySelectorAll('.options a')].map(a => a.textContent!.trim());
  // The component opens on a real (trusted) click inside its box, which a test cannot dispatch.
  const open = (name: string): void => {
    component(name).click({ isTrusted: true, target: field(name).querySelector('.input-box') } as unknown as MouseEvent);
    fixture.detectChanges();
  };
  const press = (key: string): void => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    fixture.detectChanges();
  };

  describe('text fields', () => {
    it('shows the placeholder, and marks required fields', () => {
      expect(field('name').querySelector('.placeholder label')!.textContent).toContain('Name');
      expect(field('name').querySelector('sup')).not.toBeNull();
      expect(field('title').querySelector('sup')).toBeNull();
    });

    it('shows the hint inside an empty field', () => {
      expect(field('title').querySelector('input')!.getAttribute('placeholder')).toBe('Chart title');
    });

    it('writes what is typed to its control, and tracks whether it changed', () => {
      const input = field('name').querySelector('input')!;
      input.value = 'Publications';
      input.dispatchEvent(new Event('input'));
      expect(host.form.value.name).toBe('Publications');
      expect(host.form.get('name')!.dirty).toBeTrue();

      input.value = '';
      input.dispatchEvent(new Event('input'));
      expect(host.form.get('name')!.dirty).toBeFalse();
    });

    it('goes into the danger state when invalid and touched', () => {
      expect(wrapper('name').classList).not.toContain('danger');

      host.form.get('name')!.markAsTouched();
      fixture.detectChanges();

      expect(wrapper('name').classList).toContain('danger');
    });

    it('focuses its text box when asked to, as the series name editor does', () => {
      component('name').focus(true);

      expect(document.activeElement).toBe(field('name').querySelector('input'));
    });

    it('uses the flat look by default', () => {
      expect(wrapper('name').classList).toContain('flat');
    });
  });

  it('renders a number field', () => {
    expect(field('size').querySelector('input')!.type).toBe('number');
  });

  it('renders a color field without a dropdown arrow', () => {
    expect(field('color').querySelector('input')!.type).toBe('color');
    expect(field('color').textContent).not.toContain('arrow_drop_down');
  });

  it('explains an invalid URL once the field is touched', () => {
    host.form.get('url')!.setValue('ftp://example.com/a.png');
    host.form.get('url')!.markAsTouched();
    fixture.detectChanges();

    expect(field('url').textContent).toContain('Please provide a valid URL');
  });

  describe('select fields', () => {
    it('shows the no-value text, then the label of a value set elsewhere in the form', () => {
      expect(shown('stack')).toContain('Select One');

      host.form.get('stack')!.setValue('normal');
      fixture.detectChanges();

      expect(shown('stack')).toContain('Stacked by Value');
    });

    // Loading a saved chart writes the form without events, then announces that it has finished.
    it('shows the value of a chart that finished loading', () => {
      host.form.get('agg')!.setValue('sum', { emitEvent: false });
      TestBed.inject(DynamicFormHandlingService).updateFromFile = false;
      fixture.detectChanges();

      expect(shown('agg')).toContain('Sum');
    });

    it('lists its options when opened and takes the one clicked', () => {
      open('agg');
      expect(optionLabels('agg')).toEqual(['Total', 'Count', 'Sum', 'Minimum', 'Maximum', 'Average']);

      (field('agg').querySelectorAll<HTMLElement>('.options a')[1]).click();
      fixture.detectChanges();

      expect(host.form.value.agg).toBe('count');
      expect(shown('agg')).toContain('Count');
    });

    it('can be driven from the keyboard', () => {
      open('agg');
      press('ArrowDown');
      press('ArrowDown');
      press('Enter');

      expect(host.form.value.agg).toBe('sum');
      expect(field('agg').querySelector('.options')).toBeNull();
    });

    it('takes a focused option on Enter', () => {
      open('agg');
      const option = field('agg').querySelectorAll<HTMLElement>('.options a')[4];
      option.focus();
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(host.form.value.agg).toBe('max');
      expect(field('agg').querySelector('.options')).toBeNull();
    });

    it('labels the field and its options for assistive technology', () => {
      const label = field('name').querySelector('label')!;
      expect(document.getElementById(label.htmlFor)).toBe(field('name').querySelector('input'));

      open('agg');
      const options = [...field('agg').querySelectorAll('.options a')];
      expect(options.every(option => option.getAttribute('role') === 'option')).toBeTrue();
      expect(field('agg').querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Aggregate');
    });

    it('closes on Escape without changing its value', () => {
      open('agg');
      expect(field('agg').querySelector('.options')).not.toBeNull();

      press('Escape');

      expect(field('agg').querySelector('.options')).toBeNull();
      expect(host.form.value.agg).toBeNull();
    });

    it('greys out and stays closed when its control is disabled elsewhere in the form', () => {
      host.form.get('agg')!.disable();
      fixture.detectChanges();

      expect(wrapper('agg').classList).toContain('disabled');
      expect(field('agg').textContent).toContain('lock');

      open('agg');
      expect(field('agg').querySelector('.options')).toBeNull();
    });

    it('tells its host when a value is chosen', () => {
      open('lib');
      (field('lib').querySelectorAll<HTMLElement>('.options a')[1]).click();

      expect(host.libraryChanges).toEqual(['GoogleCharts']);
    });
  });

  // The Entity field: its options arrive over HTTP after it is shown, and there are more than six,
  // so it turns into a searchable list.
  describe('select fields with many options', () => {
    const entities = ['result', 'project', 'organization', 'datasource', 'funder', 'country', 'publication', 'software'];

    beforeEach(() => {
      host.entities = entities;
      fixture.detectChanges();
    });

    it('filters its options as the user types', () => {
      open('entity');
      expect(optionLabels('entity')).toEqual(entities);

      const search = field('entity').querySelector('input')!;
      search.value = 'pro';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(optionLabels('entity')).toEqual(['project']);
    });

    it('takes the option clicked in the filtered list', () => {
      open('entity');
      const search = field('entity').querySelector('input')!;
      search.value = 'fun';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      (field('entity').querySelector<HTMLElement>('.options a')!).click();
      press('Escape');

      expect(host.form.value.entity).toBe('funder');
      expect(shown('entity')).toContain('funder');
    });

    it('shows a value set elsewhere in the form', () => {
      host.form.get('entity')!.setValue('project');
      fixture.detectChanges();

      expect(shown('entity')).toContain('project');
    });
  });
});
