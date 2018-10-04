import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {User} from "firebase";

@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {

  private isLogged: boolean;

  constructor(public http: HttpClient) {
    // nothing to do here
  }


  async verifyUser(user: User) {
    let param = "?email=" + user.email;
    param += "&uid=" + user.uid;
    param += "&method=verify";

    let result = await this.http.get(environment.turbine_ip + ":" + environment.turbine_port + "/" + param);
    return result;
  }
}
