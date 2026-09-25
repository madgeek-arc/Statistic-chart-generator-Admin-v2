import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { ChartFrameComponent } from './data-frames/chart-frame/chart-frame.component';
import { GeneratedShortUrlFieldComponent } from './data-frames/generated-short-url-field/generated-short-url-field.component';

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
  // The header names each field with a plain attribute.
  template: `<generated-short-url-field dataName="Chart" [shortUrl]="url$" [isUrlLoading]="loading$"></generated-short-url-field>`,
  imports: [GeneratedShortUrlFieldComponent]
})
class ShortUrlHostComponent {
  url$: Observable<string> = of('https://tinyurl.com/abc');
  loading$: Observable<boolean> = of(false);
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

  it('titles the field with the name passed through the dataName alias', () => {
    const fixture = TestBed.createComponent(ShortUrlHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h6').textContent.trim()).toBe('Chart TinyUrl');
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
