import { Injectable } from '@angular/core';
import {GoogleAuthService} from "../google-auth/google-auth.service";
import {ApiService} from "../api/api.service";
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private screen: Screens;
  private mode: Screens;

  constructor(private google: GoogleAuthService, private turbine: ApiService, private router: Router) {
    router.events.subscribe((val) => {
      this.navigation();
      this.mode();
    });
  }

  /**
   * Defines current position
   */
  navigation() {
    let l = location.pathname.replace(environment.base + "/", "");
    switch (l) {
      case Screens.Admin:
          this.screen = Screens.Admin;
        break;
      case Screens.Login:
        this.screen = Screens.Login;
        break;
      case Screens.Console:
        this.screen = Screens.Console;
        break;
      case Screens.Monitor:
        this.screen = Screens.Monitor;
        break;
      case Screens.Notification:
        this.screen = Screens.Notification;
        break;
      default:
        this.screen = Screens.Splash;
        break;
    }
  }

  /**
   * Checks if Turbine is on first run mode
   * It doesn't require credentials
   */
  mode() {

  }






}
