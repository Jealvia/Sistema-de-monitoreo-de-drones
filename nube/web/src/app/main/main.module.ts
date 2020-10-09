import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MainRoutingModule } from "./main-routing.module";
import { InicioComponent } from "./inicio/inicio.component";
import { MainComponent } from "./main.component";
import { apiMaterialModule } from "@apis/material-module";

import { ScommonModule } from "@apis/common-module";
import { DronComponent, DialogDron } from "./dron/dron.component";
import { RutaComponent, DialogRoute, DialogPoint } from "./ruta/ruta.component";
import { VueloComponent, SendMisionDialog } from "./vuelo/vuelo.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentsModule } from 'app/components/components.module';
import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
  declarations: [
    InicioComponent,
    MainComponent,
    DronComponent,
    RutaComponent,
    VueloComponent,
    DialogDron,
    DialogRoute,
    DialogPoint,
    SendMisionDialog,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    apiMaterialModule,
    ScommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [DialogDron,DialogRoute,DialogPoint,SendMisionDialog],
})
export class MainModule {}
