import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { BasicConfig} from "./basic_config";
import { BasicConfigCallback } from "./basic_config_callback";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _config: BasicConfig = null;

  constructor(public http: HttpClient) {
    // nothing to do here
  }

  public getBasicInfo(callback: BasicConfigCallback) {
    if (this._config !== null) {
      callback.basicConfig(this._config)
    } else {
      const headerDict = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*'
      };

      const requestOptions = {
        headers: new HttpHeaders(headerDict),
      };
      this.http.get(environment.turbine_ip + ":" + environment.turbine_port + "/?method=get_basic_info", requestOptions).toPromise()
        .then((res) => {
          console.log(JSON.stringify(res));
          this._config = new BasicConfig().fromJSON(res);
          callback.basicConfig(this._config)
        }).catch((err) => {
          console.error(JSON.stringify(err));
          callback.error(JSON.stringify(err))
        });
    }
  }

  public cleanCache() {
    this._config = null;
  }

}
