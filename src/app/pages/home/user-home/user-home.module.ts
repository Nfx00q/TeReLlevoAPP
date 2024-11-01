import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserHomePageRoutingModule } from './user-home-routing.module';

import { UserHomePage } from '../user-home/user-home.page';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserHomePageRoutingModule
  ],
  declarations: [ UserHomePage ],
  providers: [
    BarcodeScanner,
    // otros proveedores
  ],
})
export class UserHomePageModule {}
