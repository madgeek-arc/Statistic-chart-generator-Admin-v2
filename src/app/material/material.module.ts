import { NgModule } from '@angular/core';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	exports: [
		MatStepperModule,
		MatSliderModule,
		MatButtonModule,
		MatSelectModule,
		MatDividerModule,
		MatExpansionModule,
		MatTreeModule,
		MatIconModule
	]
})
export class MaterialModule { }
