import { Component, DestroyRef, inject, Input, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, Option } from "../../../../shared/input.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgIf } from "@angular/common";
import { CountriesListingService } from "../../../../services/countries-listing-service/countries-listing.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-high-maps',
  templateUrl: './high-maps.component.html',
  imports: [
    ReactiveFormsModule,
    InputComponent,
    MatSlideToggleModule,
    NgIf
  ],
  standalone: true
})

export class HighMapsComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private countriesService = inject(CountriesListingService)

  @Input() highMapsForm: FormGroup;

  protected horizontalAlignmentList: Option[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' }
  ];

  protected axisInterpolationList: Option[] = [
    { label: 'Linear', value: 'linear' },
    { label: 'Logarithmic', value: 'logarithmic' }
  ];

  countriesList: Option[] = [];


  ngOnInit() {
    this.countriesService.countriesListing().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (Array.isArray(response)) {
          this.countriesList = response.map((country) => ({label: country.name.common, value: country.cca2}));
        }
        console.log(this.countriesList);
      }
    });
  }


}
