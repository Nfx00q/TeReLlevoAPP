import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverHomePageRoutingModule } from './driver-home-routing.module';
import { DriverPage } from './driver-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverHomePageRoutingModule
  ],
  declarations: [DriverPage]
})
export class DriverHomePageModule {}
