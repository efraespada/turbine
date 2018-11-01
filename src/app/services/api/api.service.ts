import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BasicConfig} from "./basic_config";
import {AppConfigService} from "../app-config/app.config.service";
import {GoogleAuthService} from "../google-auth/google-auth.service";
import {Mode} from "../../enums/mode";
import {Util} from "../../enums/enum_utils";
import {Screens} from "../../enums/screens";

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*'
  };
  private requestOptions = {
    headers: new HttpHeaders(this.headerDict),
  };

  private _apiKey: string = null;

  constructor(private google: GoogleAuthService, private http: HttpClient) {
    // nothing to do here
  }

  /**
   * Returns Turbine mode
   */
  async getMode(): Promise<Mode> {
    let response = await this.http.get(AppConfigService.settings.ip + ":"+ AppConfigService.settings.port
      + "/database?method=get_basic_info", this.requestOptions).toPromise();
    let config = new BasicConfig().fromJSON(response);
    if (Util.existValueInEnum(Mode, config.mode)) {
      return Mode[config.mode];
    } else {
      return Mode.Off
    }
  }

  async getDatabasesInfo() {
    let response = await this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?method=get_databases_info&apiKey="
      + this._apiKey + "&uid=" + this.google.currentUser.uid, this.requestOptions).toPromise();

    return this.updateDatabases(response);
  }

  async login() : Promise<boolean> {
    if (!this.google.authenticated) {
      await this.google.alogin()
    }
    if (this.google.authenticated) {
      let res: any = await this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?method=login&user=" + JSON.stringify(this.google.currentUser), this.requestOptions).toPromise();
      this._apiKey = res.apiKey;
      return true
    }
    return false;
  }

  async createAdmin() {
    if (!this.google.authenticated) {
      return
    }
    let data = {
      method: "add_member",
      user: this.google.currentUser
    };
    return await this.http.post(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database", JSON.stringify(data), this.requestOptions).toPromise()
  }

  public async createDatabase(name: string) {
    let data = {
      method: "create_database",
      uid: this.google.currentUser.uid,
      apiKey: this._apiKey,
      name: name
    };
    return await this.http.post(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database", JSON.stringify(data), this.requestOptions).toPromise();
  }

  private updateDatabases(data: any) {
    let _databases = [];
    let databases_name = Object.keys(data);
    for (let name in databases_name) {
      let collection_keys = Object.keys(data[databases_name[name]].collections);
      let size = 0;
      for (let i in collection_keys) {
        size += data[databases_name[name]].collections[collection_keys[i]].length
      }
      data[databases_name[name]].collections = collection_keys.length;
      data[databases_name[name]].total_size = (size / 10000000.0) / 1024;
      _databases.push(data[databases_name[name]])
    }
    return _databases;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(value: string) {
    this._apiKey = value;
  }

  get authenticated(): boolean {
    return this._apiKey !== null;
  }

}
