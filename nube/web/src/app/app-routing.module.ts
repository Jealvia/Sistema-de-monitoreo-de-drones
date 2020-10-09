import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  /* {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule), // Lazy load account module
    data: { preload: true }
  }, */
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule), // Lazy load account module
    data: { preload: true }
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
