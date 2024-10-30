import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverHomePageModule } from './driver-home.module';

const routes: Routes = [
  {
    path: '',
    component: DriverHomePageModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverHomePageRoutingModule {}
