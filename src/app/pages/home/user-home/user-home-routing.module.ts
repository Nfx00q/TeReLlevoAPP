import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserHomePage } from './user-home.page';

const routes: Routes = [
  {
    path: '',
    component: UserHomePage
  },
  {
    path: 'config-page',
    loadChildren: () => import('./config-page/config-page.module').then( m => m.ConfigPagePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserHomePageRoutingModule {}
