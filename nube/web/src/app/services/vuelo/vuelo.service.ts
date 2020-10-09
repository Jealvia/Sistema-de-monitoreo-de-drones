import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Constants from "../constants";
import { headers } from "../constants";

@Injectable({
  providedIn: "root",
})
export class VueloService {
  constructor(private http: HttpClient) {}

  getMisiones() {
    let response;
    try {
      response = this.http.get<any>(`${Constants.API_ENDPOINT}` + "data", {
        headers,
      });
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  crearMision(data: any) {
    let response;
    try {
      response = this.http.post<any>(
        `${Constants.API_ENDPOINT}` + "mision",
        data,
        {
          headers,
        }
      );
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  getMisionData(id: string) {
    let response;
    try {
      response = this.http.get<any>(
        `${Constants.API_ENDPOINT}` + "arduinomision?_id=" + id,
        {
          headers,
        }
      );
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  getMisionesActivas(){
    let response;
    try {
      response = this.http.get<any>(`${Constants.API_ENDPOINT}` + "misiones/activas", {
        headers,
      });
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  getListadoMisiones(){
    let response;
    try {
      response = this.http.get<any>(`${Constants.API_ENDPOINT}` + "mision", {
        headers,
      });
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

}
