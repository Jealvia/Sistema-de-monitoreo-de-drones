import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { InicioComponent } from './inicio/inicio.component';
import { DronComponent } from './dron/dron.component';
import { RutaComponent } from './ruta/ruta.component';
import { VueloComponent } from './vuelo/vuelo.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'dron', component: DronComponent },
      { path: 'ruta', component: RutaComponent },
      { path: 'vuelo', component: VueloComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
