import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { ChartFrameComponent } from './data-frames/chart-frame/chart-frame.component';
import { GeneratedShortUrlFieldComponent } from './data-frames/generated-short-url-field/generated-short-url-field.component';
import { InputComponent } from './shared/input.component';

// Components whose @Input()s and @Output()s moved to input() and output(): bind real values through a host template,
// the way the app does, and check what the component does with them.

@Component({
  template: `<chart-frame [chartUrl]="url"></chart-frame>`,
  imports: [ChartFrameComponent]
})
class ChartFrameHostComponent {
  url: string | null = 'about:blank#first';
}

@Component({
  template: `<generated-short-url-field [shortUrl]="url$" [isUrlLoading]="loading$"></generated-short-url-field>`,
  imports: [GeneratedShortUrlFieldComponent]
})
class ShortUrlHostComponent {
  url$: Observable<string> = of('https://tinyurl.com/abc');
  loading$: Observable<boolean> = of(false);
}

@Component({
  template: `<div input placeholder="Name" [value]="value" [disabled]="disabled" [password]="password"
                  (valueChange)="valueChanges.push($event)" (focusEmitter)="focusEvents.push($event)"></div>`,
  imports: [InputComponent]
})
class InputHostComponent {
  value = 'abc';
  disabled = false;
  password = false;
  valueChanges: unknown[] = [];
  focusEvents: boolean[] = [];
}

describe('chart-frame with a signal chartUrl input', () => {
  const iframeSrc = (fixture: ComponentFixture<unknown>) =>
    fixture.nativeElement.querySelector('iframe')?.getAttribute('src');

  it('renders the bound URL and follows later changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(ChartFrameHostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(iframeSrc(fixture)).toBe('about:blank#first');

    fixture.componentInstance.url = 'about:blank#second';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(iframeSrc(fixture)).toBe('about:blank#second');
  }));
});

describe('generated-short-url-field with aliased signal inputs', () => {
  it('shows the URL passed through the shortUrl alias', () => {
    const fixture = TestBed.createComponent(ShortUrlHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.url-holder').textContent.trim()).toBe('https://tinyurl.com/abc');
  });

  it('shows the loading state passed through the isUrlLoading alias instead of the URL', () => {
    const fixture = TestBed.createComponent(ShortUrlHostComponent);
    fixture.componentInstance.loading$ = of(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.url-holder')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });

  // The URL is produced by a request, so both streams emit after the field has rendered.
  it('follows the URL and loading streams as they emit', () => {
    const url$ = new BehaviorSubject('https://tinyurl.com/one');
    const loading$ = new BehaviorSubject(true);
    const fixture = TestBed.createComponent(ShortUrlHostComponent);
    fixture.componentInstance.url$ = url$;
    fixture.componentInstance.loading$ = loading$;
    const link = () => fixture.nativeElement.querySelector('a.url-holder');
    fixture.detectChanges();
    expect(link()).toBeNull();

    loading$.next(false);
    fixture.detectChanges();
    expect(link().textContent.trim()).toBe('https://tinyurl.com/one');

    url$.next('https://tinyurl.com/two');
    fixture.detectChanges();
    expect(link().textContent.trim()).toBe('https://tinyurl.com/two');
  });

  it('copies the bound URL to the clipboard', () => {
    if (!navigator.clipboard) {
      pending('Clipboard API is not available in this browser');
      return;
    }
    const writeText = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    const fixture = TestBed.createComponent(ShortUrlHostComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(writeText).toHaveBeenCalledWith('https://tinyurl.com/abc');
  });
});

describe('InputComponent with signal inputs', () => {
  let fixture: ComponentFixture<InputHostComponent>;
  let host: InputHostComponent;
  const control = () => fixture.debugElement.query(By.directive(InputComponent)).componentInstance.formControl;

  beforeEach(() => {
    fixture = TestBed.createComponent(InputHostComponent);
    host = fixture.componentInstance;
  });

  it('builds its control from the value and disabled inputs', () => {
    host.value = 'abc';
    host.disabled = true;
    fixture.detectChanges();

    expect(control().value).toBe('abc');
    expect(control().disabled).toBeTrue();
  });

  it('follows later changes to value and disabled (ngOnChanges)', () => {
    fixture.detectChanges();
    expect(control().enabled).toBeTrue();

    host.value = 'xyz';
    host.disabled = true;
    fixture.detectChanges();
    expect(control().value).toBe('xyz');
    expect(control().disabled).toBeTrue();

    host.disabled = false;
    fixture.detectChanges();
    expect(control().enabled).toBeTrue();
  });

  it('renders a password field when the password input is set', () => {
    host.password = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input.input').type).toBe('password');
  });

  // Outputs (formerly EventEmitters): a listener on the host must still receive them.
  it('emits valueChange to a host listener when the control value changes', () => {
    fixture.detectChanges();

    control().setValue('typed');

    expect(host.valueChanges).toEqual(['typed']);
  });

  it('emits focusEmitter to a host listener when focus changes', () => {
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.directive(InputComponent)).componentInstance as InputComponent;

    input.focus(true);
    input.focus(false);

    expect(host.focusEvents).toEqual([true, false]);
  });
});
