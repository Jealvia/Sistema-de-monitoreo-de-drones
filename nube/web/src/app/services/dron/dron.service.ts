import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Constants from "../constants";
import { IDron } from "./type";
import { headers } from "../constants";

@Injectable({
  providedIn: "root",
})
export class DronService {
  constructor(private http: HttpClient) {}

  getDrones() {
    let response;
    try {
      response = this.http.get<any>(`${Constants.API_ENDPOINT}` + "dron", {
        headers,
      });
    } catch (error) {
      console.log("error:" + error);
    }
    return response;
  }

  saveDron(data: IDron) {
    let response;
    try {
      response = this.http.post<any>(
        `${Constants.API_ENDPOINT}` + "dron",
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

  updateDron(data: any) {
    let response;
    try {
      response = this.http.patch<any>(
        `${Constants.API_ENDPOINT}` + "dron",
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
}
