import { NgModule } from '@angular/core';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
	exports: [
		MatStepperModule,
		MatSliderModule,
		MatButtonModule
	]
})
export class MaterialModule { }
