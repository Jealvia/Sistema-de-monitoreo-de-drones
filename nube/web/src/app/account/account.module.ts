import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';

//apis
import { ScommonModule } from "@apis/common-module";
import { apiMaterialModule } from '@apis/material-module';

import { BrowserModule }    from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,

    //apis
    ScommonModule,
    apiMaterialModule,


    //BrowserModule,
    HttpClientModule
  ],
  providers: [  ]
})
export class AccountModule { }







