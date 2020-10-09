import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Constants from "../constants";
import { headers } from "../constants";
import { IRuta } from "./type";

@Injectable({
  providedIn: "root",
})
export class RutaService {
  constructor(private http: HttpClient) {}

  getRutas() {
    let response;
    try {
      response = this.http.get<any>(`${Constants.API_ENDPOINT}` + "ruta", {
        headers,
      });
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  saveRuta(data: any) {
    let response;
    try {
      response = this.http.post<any>(
        `${Constants.API_ENDPOINT}` + "ruta",
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

  updateRuta(data: any) {
    let response;
    try {
      response = this.http.patch<any>(
        `${Constants.API_ENDPOINT}` + "ruta",
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

  loadRutaDocument(data: any) {
    let response;
    try {
      response = this.http.post<any>(
        `${Constants.API_ENDPOINT}` + "ruta/file",
        data
      );
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }
}
