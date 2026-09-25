import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [provideRouter([])],
}));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`should have as title 'Statistic Chart Generator Admin V2'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('Statistic Chart Generator Admin V2');
  });

  it('should render without throwing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

// The root as the app bootstraps it: a header, the page the router shows, and nothing else. Pages are
// activated by navigation, which no template event starts, so the specs navigate from outside.
@Component({ selector: 'app-header', template: '<header class="header-stub">Header</header>' })
class HeaderStub {}

@Component({ selector: 'app-dashboard-page', template: '<p class="page">Dashboard page</p>' })
class DashboardPage {}

@Component({ selector: 'app-not-found-page', template: '<p class="page">Not found page</p>' })
class NotFoundPage {}

@Component({ template: '<app-root></app-root>', imports: [AppComponent] })
class HostComponent {}

describe('AppComponent in the app', () => {
  beforeEach(() => {
    TestBed.overrideComponent(AppComponent, { set: { imports: [HeaderStub, RouterOutlet] } });
    TestBed.configureTestingModule({
      providers: [provideRouter([
        { path: 'dashboard', component: DashboardPage },
        { path: '**', component: NotFoundPage }
      ])]
    });
  });

  const page = (fixture: { nativeElement: HTMLElement }): string | undefined =>
    fixture.nativeElement.querySelector('.page')?.textContent?.trim();

  it('shows the header and the footer around the page', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
    TestBed.inject(Router).navigateByUrl('/dashboard');
    tick();
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement.querySelector('app-root');
    expect([...root.children].map(child => child.tagName.toLowerCase())).toEqual(['app-header', 'div', 'router-outlet', 'app-dashboard-page', 'footer']);
    expect(page(fixture)).toBe('Dashboard page');
  }));

  it('shows the page a later navigation activates', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
    const router = TestBed.inject(Router);
    router.navigateByUrl('/dashboard');
    tick();
    fixture.detectChanges();
    expect(page(fixture)).toBe('Dashboard page');

    router.navigateByUrl('/nowhere');
    tick();
    fixture.detectChanges();

    expect(page(fixture)).toBe('Not found page');
    expect(fixture.nativeElement.querySelectorAll('.page').length).toBe(1);
  }));
});
