import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

import { HeaderComponent } from './header.component';
import { ChartLoadingService } from '../services/chart-loading-service/chart-loading.service';
import { DynamicFormHandlingService } from '../services/dynamic-form-handling-service/dynamic-form-handling.service';
import { FormFactoryService } from '../services/form-factory-service/form-factory-service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FormFactoryService).createForm();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const link = (text: string) => [...el().querySelectorAll('a')].find(a => a.textContent?.trim() === text) as HTMLAnchorElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Everything below changes without any event inside the header, which must still show it.

  it('puts Share in the tab order once the dashboard form becomes valid', () => {
    expect(link('Share').tabIndex).toBe(-1);

    // Drop every validator, children first, so each group re-validates on top of valid children.
    const clearValidators = (control: AbstractControl): void => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        Object.values(control.controls).forEach(clearValidators);
      }
      control.clearValidators();
      control.updateValueAndValidity({ onlySelf: control.parent !== null });
    };
    clearValidators(TestBed.inject(FormFactoryService).getFormRoot());
    fixture.detectChanges();

    expect(link('Share').tabIndex).toBe(0);
    expect(link('Share').getAttribute('aria-disabled')).toBe('false');
  });

  it('shows the loading indicator while a chart file is read', () => {
    expect(el().querySelector('[role="status"]')).toBeNull();

    TestBed.inject(ChartLoadingService).chartLoadingStatus = true;
    fixture.detectChanges();

    expect(el().querySelector('[role="status"]')).not.toBeNull();
  });

  it('shows the name of the loaded chart file', async () => {
    const file = new File(['{}'], 'my-chart.json', { type: 'application/json' });
    TestBed.inject(DynamicFormHandlingService).loadForm({ target: { files: [file] } } as unknown as Event);
    await new Promise(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();

    expect(el().textContent).toContain('my-chart.json');
  });

  it('clears the URL error message after 4 seconds', fakeAsync(() => {
    const loadButton = [...el().querySelectorAll('button')].find(b => b.textContent?.trim() === 'Load') as HTMLButtonElement;
    loadButton.click();
    fixture.detectChanges();
    expect(el().textContent).toContain('Missing URL');

    tick(4000);
    fixture.detectChanges();

    expect(el().textContent).not.toContain('Missing URL');
  }));
});
