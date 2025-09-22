import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Country {
  name: Name;
  cca2: string;
}

export interface Name {
  common:     string;
  official:   string;
  nativeName: { [key: string]: NativeName };
}

export interface NativeName {
  official: string;
  common:   string;
}


@Injectable({providedIn: 'root'})

export class CountriesListingService {

  constructor(private http: HttpClient){}

  countriesListing() {
  // { return this.http.get('https://restcountries.com/v3.1/all', {observe: 'body', responseType: 'json'}).pipe(first()); }
    //   You must specify the fields you need (up to 10 fields) when calling the all endpoints.
    return this.http.get<Country | Country[]>('https://restcountries.com/v3.1/all?fields=name,cca2')
  }

}
