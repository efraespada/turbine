import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {Screens} from "../../enums/screens";
import {Util} from "../../enums/enum_utils";

@Injectable({
  providedIn: 'root'
})

export class RouterService {

  private auto: boolean = false;

  constructor(public router: Router) {
    // nothing to do here
  }

  public screenChanged(callback) {
    this.router.events.subscribe(() => {
      if (this.auto) {
        this.auto = false;
        callback()
      }
    });
  }

  get screen(): Screens {
    let l = location.pathname.replace(environment.base + "/", "");
    if (Util.existValueInEnum(Screens, l)) {
      return Screens[l];
    } else {
      return Screens.Splash
    }
  }

  public goSplash() {
    this.auto = true;
    this.router.navigateByUrl('/splash').then(function () {
      // nothing to do here
    });
  }

  public goLogin() {
    this.auto = true;
    this.router.navigateByUrl('/login').then(function () {
      // nothing to do here
    });
  }

  public goConsole() {
    this.auto = true;
    this.router.navigateByUrl('/console').then(function () {
      // nothing to do here
    });
  }

  public goAdmin() {
    this.auto = true;
    this.router.navigateByUrl('/admin').then(function () {
      // nothing to do here
    });
  }

  public goError() {
    this.auto = true;
    this.router.navigateByUrl('/notification').then(function () {
      // nothing to do here
    });
  }

  public goMonitor() {
    this.auto = true;
    this.router.navigateByUrl('/monitor').then(function () {
      // nothing to do here
    });
  }

  public goToUrl(url: string) {
    window.open(url, '_blank');
  }

}


