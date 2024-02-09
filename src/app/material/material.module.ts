import { NgModule } from '@angular/core';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
	exports: [
		MatStepperModule,
		MatSliderModule,
		MatButtonModule,
		MatSelectModule
	]
})
export class MaterialModule { }
