import {Injectable} from '@angular/core';
import {GoogleAuthService} from "../google-auth/google-auth.service";
import {ApiService} from "../api/api.service";
import {RouterService} from "../router/router.service";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private _screen: Screens;
  private _mode: Mode;

  constructor(private google: GoogleAuthService, private turbine: ApiService, private router: RouterService) {
    this.analyze().then(() => {
      router.screenChanged(() => {
        this.analyze().then(() => {
          // nothing to do here
        })
      });
    })
  }

  /**
   * Let's go
   */
  async analyze() {
    this.screen();
    await this.mode();
    this.move()
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
    this._mode = await this.turbine.getMode();
  }

  /**
   * Moves the application to the needed place
   */
  move() {
    if (this._mode === Mode.FirstRun && this._screen !== Screens.Admin) {
      this.router.goAdmin();
    } else if (this._mode === Mode.Off && this._screen !== Screens.Notification) {
      this.router.goError();
    } else if ((!this.google.authenticated || !this.turbine.authenticated) && (this._screen !== Screens.Login && this._screen !== Screens.Notification)) {
      this.router.goLogin();
    } else {
      // work!
      if (this._screen === Screens.Splash || this._screen === Screens.Login || this._screen === Screens.Notification) {
        this.router.goConsole()
      }
    }
  }

  get navigation(): RouterService {
    return this.router
  }


}
