import { NgModule } from '@angular/core';

import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
	exports: [
		MatStepperModule,
		MatSliderModule,
		MatButtonModule,
		MatSelectModule,
		MatDividerModule,
		MatExpansionModule,
		MatTreeModule,
		MatIconModule,
		MatProgressBarModule,
		MatTabsModule,
		MatInputModule,
		MatSlideToggleModule,
		MatDialogModule,
		MatCheckboxModule,
		MatMenuModule,
		MatRadioModule
	]
})

export class MaterialModule { }
