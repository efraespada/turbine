import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BasicConfig} from "./basic_config";
import {BasicConfigCallback} from "./basic_config_callback";
import {User} from "firebase";
import {CreateAdminCallback} from "./create_admin_callback";
import {LoginCallback} from "./login_callback";
import {DatabasesInfoCallback} from "./databases_info_callback";
import {AppConfigService} from "../app-config/app.config.service";
import {ITurbinePost} from "./i.turbine.post";
import {ITurbineGet} from "./i.turbine.get";
import {ITurbineQuery} from "./i.turbine.query";
import {GoogleAuthService} from "../google-auth/google-auth.service";

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  public _config: BasicConfig = null;
  public _databases_info: any = null;
  public _databases: any = null;
  private _apiKey: string = null;
  private _user: User = null;

  constructor(private http: HttpClient) {
    // nothing to do here
  }

  /**
   * Returns Turbine mode
   */
  async getMode(): Promise<Mode> {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let response = await this.http.get(AppConfigService.settings.ip + ":"+ AppConfigService.settings.port
      + "/database?method=get_basic_info", requestOptions).toPromise();
    this._config = new BasicConfig().fromJSON(response);
    if (this._config.mode in Mode) {
      return Mode[this._config.mode];
    } else {
      return Mode.Off
    }
  }

  async getDatabasesInfo() {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    let response = await this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?method=get_databases_info&apiKey="
      + this._apiKey + "&uid=" + this._user.uid, requestOptions).toPromise();

    return this.updateDatabases(response);
  }

  public login(user: User, callback: LoginCallback) {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    this.http.get(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database?method=login&user=" + JSON.stringify(user), requestOptions).toPromise()
      .then((res: any) => {
        try {
          callback.apiKey(res.apiKey)
        } catch (e) {
          console.error(JSON.stringify(e));
          callback.error(e.toString());
        }
      }).catch((err) => {
      console.error(JSON.stringify(err));
      callback.error(err.status + " " + err.statusText + " (" + err.error + ")");
    });

  }

  async createAdmin(user: User) {
    let data = {
      method: "add_member",
      user: user
    };
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    return await this.http.post(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database", JSON.stringify(data), requestOptions).toPromise()
  }

  public async createDatabase(name: string, user: User) {
    let data = {
      method: "create_database",
      uid: user.uid,
      apiKey: this._apiKey,
      name: name
    };
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    return await this.http.post(AppConfigService.settings.ip + ":" + AppConfigService.settings.port + "/database", JSON.stringify(data), requestOptions).toPromise();
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
      data[databases_name[name]].total_size = size;
      _databases.push(data[databases_name[name]])
    }
    return _databases;
  }

  public cleanCache() {
    this._config = null;
  }

  public cleanCacheDatabases() {
    this._databases_info = null;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(value: string) {
    this._apiKey = value;
  }


  get user(): firebase.User {
    return this._user;
  }

  set user(value: firebase.User) {
    this._user = value;
  }

  get databases_info(): any {
    return this._databases_info;
  }

  set databases_info(value: any) {
    this._databases_info = value;
  }

  get authenticated(): boolean {
    return this._apiKey !== null;
  }

}
