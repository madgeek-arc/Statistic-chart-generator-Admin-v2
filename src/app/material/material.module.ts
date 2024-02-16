import { NgModule } from '@angular/core';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
	exports: [
		MatStepperModule,
		MatSliderModule,
		MatButtonModule,
		MatSelectModule,
		MatDividerModule,
		MatExpansionModule
	]
})
export class MaterialModule { }
