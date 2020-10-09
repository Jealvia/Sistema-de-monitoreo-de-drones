import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as Constants from './constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  token=this.cookieService.get('token');
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    
  ) { }

  url = Constants.API_ENDPOINT;
  
  almacenarToken(token):any{
    let response;
    let datos={
      'token':String(token)
    }
    try {
      response = this.http.post < any > (`${Constants.API_ENDPOINT}` + "registrar-token-web/",
      datos,{
         headers: {
        'Content-Type': "application/x-www-form-urlencoded",
        'Authorization': "Token " + this.cookieService.get('token'),
        }
      });
    } catch (error) {
      console.log("error:" + error)
    }
    return response;
  }
  //2020-01-20T14:54:51.099-05:00
  formatDate(fecha:Date){
    console.warn("Format//////////////////////:", fecha);
    //let result = fecha.getFullYear() + '-'+(fecha.getMonth() + 1) +'-' + fecha.getDate() + 'T00:00:00.099-05:00' 
    let result = fecha.toISOString();
    return result;
  }

  getDrones(){
    let response;
    try {
      response = this.http.get < any > (`${Constants.API_ENDPOINT}` + "dron?_id=5f068deff151dcb911945fd0",
      {
         headers: {
        'Content-Type': "application/json"
        }
      });
    } catch (error) {
      console.log("error:" + error)
    }
    return response;
  }
  

}
