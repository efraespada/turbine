import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BasicConfig} from "./basic_config";
import {BasicConfigCallback} from "./basic_config_callback";
import {User} from "firebase";
import {CreateAdminCallback} from "./create_admin_callback";
import {LoginCallback} from "./login_callback";
import {DatabasesInfoCallback} from "./databases_info_callback";
import {environment} from "../../../assets/config";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _config: BasicConfig = null;
  public _databases_info: any = null;
  private _apiKey: string = null;
  private _user: User = null;

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
          this._config = new BasicConfig().fromJSON(res);
          callback.basicConfig(this._config)
        }).catch((err) => {
        console.error(JSON.stringify(err));
        callback.error(JSON.stringify(err))
      });
    }
  }

  public getDatabaseInfo(callback: DatabasesInfoCallback) {
    if (this._user === null) {
      callback.error("not_logged_yet");
      return
    }
    if (this._apiKey !== null && this._apiKey !== undefined) {
      this.internalGetDatabasesInfo(callback)
    } else {
      let a = this;
      this.login(this._user, new class implements LoginCallback {
        apiKey(apiKey: string) {
          a._apiKey = apiKey;
          console.info("apiKey 2: " + apiKey);
          a.internalGetDatabasesInfo(callback)
        }

        error(error: string) {
          callback.error(error)
        }
      })
    }
  }

  private internalGetDatabasesInfo(callback: DatabasesInfoCallback) {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*'
    };
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    this.http.get(environment.turbine_ip + ":" + environment.turbine_port + "/?method=get_databases_info&apiKey="
      + this._apiKey + "&uid=" + this._user.uid, requestOptions).toPromise()
      .then((res) => {
        this._databases_info = res;
        callback.info(res)
      }).catch((err) => {
      console.error(err.toString());
      callback.error(JSON.stringify(err))
    });
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

    this.http.get(environment.turbine_ip + ":" + environment.turbine_port + "/?method=login&user=" + JSON.stringify(user), requestOptions).toPromise()
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

  public createAdmin(user: User, callback: CreateAdminCallback) {
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
    this.http.post(environment.turbine_ip + ":" + environment.turbine_port + "/", JSON.stringify(data), requestOptions).toPromise()
      .then((res) => {
        callback.created()
      }).catch((err) => {
      callback.error(JSON.stringify(err))
    });
  }

  public createDatabase(name: string, callback: DatabasesInfoCallback) {
    if (this._user === null) {
      callback.error("not_logged_yet");
      return
    }
    if (this._apiKey !== null && this._apiKey !== undefined) {
      this.internalCreateDatabase(name, this._user, callback)
    } else {
      let a = this;
      this.login(this._user, new class implements LoginCallback {
        apiKey(apiKey: string) {
          a._apiKey = apiKey;
          console.info("apiKey 3: " + apiKey);
          a.internalCreateDatabase(name, a._user, callback)
        }

        error(error: string) {
          callback.error(error)
        }
      })
    }
  }

  private internalCreateDatabase(name: string, user: User, callback: DatabasesInfoCallback) {
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
    this.http.post(environment.turbine_ip + ":" + environment.turbine_port + "/", JSON.stringify(data), requestOptions).toPromise()
      .then((res) => {
        this._databases_info = res;
        callback.info(res)
      }).catch((err) => {
      callback.error(JSON.stringify(err))
    });
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

}
