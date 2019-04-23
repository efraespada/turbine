import {Injectable} from '@angular/core';
import {GoogleAuthService} from "../google-auth/google-auth.service";
import {ApiService} from "../api/api.service";
import {RouterService} from "../router/router.service";
import {MessagesService} from "../messages/messages.service";
import {Mode} from "../../enums/mode";
import {Screens} from "../../enums/screens";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private _screen: Screens;
  private _mode: Mode;

  constructor(private _google: GoogleAuthService, private _turbine: ApiService, private router: RouterService,
              private _messages: MessagesService) {
    _google.currentUserObservable.subscribe((auth) => {
      this._google.currentUser = auth;
      this.analyze().then(() => {})
    });
  }

  /**
   * Let's go
   */
  async analyze() {
    await this._google.verifySession();
    await this._turbine.verifySession();
    await this.mode();
    await this.move()
  }

  /**
   * Defines current position
   */
  screen() {
    this._screen = this.router.screen;
  }

  /**
   * Checks if Turbine is on first run mode
   * It doesn't require credentials
   */
  async mode() {
    this._mode = await this._turbine.getMode();
  }

  /**
   * Moves the application to the needed place
   */
  async move() {
    if (this._mode === Mode.FirstRun && this._screen !== Screens.Admin) {
      this.router.goAdmin();
    } else if (this._mode === Mode.Logout && this._screen !== Screens.Notification) {
      this.router.goMainMessage();
    } else if (this._mode === Mode.Off && this._screen !== Screens.Notification) {
      console.log("error");
      this.router.goMainMessage();
    } else if ((!this.google.authenticated || !this._turbine.authenticated) && !this.isOnPageForLogedOut) {
      this._messages.currentMessage = "You are not logged";
      this.router.goMainMessage();
    } else if (this.google.authenticated && this._turbine.authenticated && this.isOnPageForLogedOut) {
      this.router.goConsole()
    }
  }

  get navigation(): RouterService {
    return this.router
  }

  get google(): GoogleAuthService {
    return this._google
  }

  get turbine(): ApiService {
    return this._turbine
  }

  login() {
    this._google.asyncLogin().then(() => {});
  }

  logout() {
    this._google.logout().then(() => {
      this.notify.currentMessage = "See you soon";
      this.navigation.goMainMessage()
    });
  }

  get notify(): MessagesService {
    return this._messages
  }

  get isMainContent(): boolean {
    this.screen();
    return this._screen === Screens.Console || this._screen === Screens.Monitor
  }

  get isOnPageForLogedOut(): boolean {
    return this._screen === Screens.Splash || this._screen === Screens.Login || this._screen === Screens.Notification
  }

}
