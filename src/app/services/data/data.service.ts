import {Injectable} from '@angular/core';
import {SocketService} from "../socket/socket.service";
import {SessionService} from "../session/session.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AppConfigService} from "../app-config/app.config.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  /**
   * Databases info
   */
  private _databases;

  private headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*'
  };
  private requestOptions = {
    headers: new HttpHeaders(this.headerDict),
  };

  constructor(private session: SessionService, private http: HttpClient, private socket: SocketService) {
    // nothing to do here
  }

  async createDatabase(name: string) {
    if (this.session.turbine.authenticated) {
      try {
        await this.session.turbine.createDatabase(name);
        this._databases = await this.session.turbine.getDatabasesInfo()
      } catch (e) {
        // TODO notify error
      }
    }
  }

  async updateDatabases() {
    if (this.session.turbine.authenticated) {
      try {
        this._databases = await this.session.turbine.getDatabasesInfo()
      } catch (e) {
        // TODO notify error
      }
    }
  }

  /**
   * Returns databases info
   */
  get databases(): any {
    return this._databases;
  }

  async get(database: string, path: string, mask: any) {
    let params = "database=" + database + "&method=get"
      + "&path=" + path + "&apiKey=" + this.session.turbine.apiKey + "&uid=" + this.session.google.currentUser.uid;
    if (mask != null && mask !== undefined) {
      params += "&mask=" + JSON.stringify(mask)
    }
    let response = await this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?" + params, this.requestOptions).toPromise();
    if (response["headers"] !== undefined) {
      response["headers"] = undefined;
    }
    await this.updateDatabases();
    return response
  }

  async query(database: string, path: string, query: any, mask: any) {
    let params = "database=" + database + "&method=query"
      + "&path=" + path + "&query=" + JSON.stringify(query) + "&apiKey=" + this.session.turbine.apiKey + "&uid="
      + this.session.google.currentUser.uid;
    if (mask != null && mask !== undefined) {
      params += "&mask=" + JSON.stringify(mask)
    }
    let response = await this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?" + params, this.requestOptions).toPromise();
    if (response["headers"] !== undefined) {
      response["headers"] = undefined;
    }
    await this.updateDatabases();
    return response
  }

  async post(database: string, path: string, obj: any) {
    let data = {
      method: "post",
      database: database,
      path: path,
      value: obj,
      uid: this.session.google.currentUser.uid,
      apiKey: this.session.turbine.apiKey
    };
    let response = await this.http.post(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database", JSON.stringify(data), this.requestOptions).toPromise();
    if (response["headers"] !== undefined) {
      response["headers"] = undefined;
    }
    await this.updateDatabases();
    return response;
  }


}
