import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, Option } from "../../../../shared/input.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

import { CountriesListingService } from "../../../../services/countries-listing-service/countries-listing.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { refreshOnFormChanges } from "../refresh-on-form-changes";

@Component({
    selector: 'app-high-maps',
    templateUrl: './high-maps.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    ReactiveFormsModule,
    InputComponent,
    MatSlideToggleModule
]
})

export class HighMapsComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private countriesService = inject(CountriesListingService)

  readonly highMapsForm = input<FormGroup>(undefined);

  protected horizontalAlignmentList: Option[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' }
  ];

  protected axisInterpolationList: Option[] = [
    { label: 'Linear', value: 'linear' },
    { label: 'Logarithmic', value: 'logarithmic' }
  ];

  // A signal: the list arrives over HTTP, after the first render, and the panel is OnPush.
  countriesList = signal<Option[]>([]);

  constructor() {
    refreshOnFormChanges(this.highMapsForm);
  }

  ngOnInit() {
    this.countriesService.countriesListing().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (Array.isArray(response)) {
          this.countriesList.set(response.map((country) => ({label: country.name.common, value: country.cca2})));
        }
      }
    });
  }


}
