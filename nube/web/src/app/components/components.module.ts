
import { apiMaterialModule } from 'app/apis/material-module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from './siderbar/siderbar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [SiderbarComponent, NavbarComponent, FooterComponent],
  imports: [
    CommonModule,
    apiMaterialModule
  ],
  exports: [SiderbarComponent, NavbarComponent, FooterComponent]
})
export class ComponentsModule { }
