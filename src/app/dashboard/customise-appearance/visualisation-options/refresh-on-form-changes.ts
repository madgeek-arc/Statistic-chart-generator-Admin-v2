import { ChangeDetectorRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { EMPTY, merge, switchMap } from 'rxjs';

import { DynamicFormHandlingService } from '../../../services/dynamic-form-handling-service/dynamic-form-handling.service';

/**
 * An OnPush panel shows a form it receives by reference, and that form changes without any event
 * inside the panel. This marks the panel for check when the form emits a value or status change,
 * and when a saved chart finishes loading: the load writes the form with `emitEvent: false`, so it
 * emits nothing itself, and signals completion through `DynamicFormHandlingService.jsonLoaded`.
 *
 * Call it from the constructor with the panel's form input.
 */
export function refreshOnFormChanges(form: Signal<AbstractControl | null | undefined>): void {
  const cdr = inject(ChangeDetectorRef);
  const chartLoaded$ = inject(DynamicFormHandlingService).jsonLoaded;
  const formChanges$ = toObservable(form).pipe(
    switchMap(control => control ? merge(control.valueChanges, control.statusChanges) : EMPTY)
  );

  merge(formChanges$, chartLoaded$)
    .pipe(takeUntilDestroyed())
    .subscribe(() => cdr.markForCheck());
}
