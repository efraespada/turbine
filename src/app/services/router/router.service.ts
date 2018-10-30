import {Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class RouterService {

  constructor(public router: Router) {
    // nothing to do here
  }

  public screenChanged(callback) {
    this.router.events.subscribe(() => {
      callback()
    });
  }

  get screen(): Screens {
    let l = location.pathname.replace(environment.base + "/", "");
    if (l in Screens) {
      return Screens[l];
    } else {
      return Screens.Splash
    }
  }

  public goSplash() {
    this.router.navigateByUrl('/splash').then(function () {
      // nothing to do here
    });
  }

  public goLogin() {
    this.router.navigateByUrl('/login').then(function () {
      // nothing to do here
    });
  }

  public goConsole() {
    this.router.navigateByUrl('/console').then(function () {
      // nothing to do here
    });
  }

  public goAdmin() {
    this.router.navigateByUrl('/admin').then(function () {
      // nothing to do here
    });
  }

  public goError() {
    this.router.navigateByUrl('/notification').then(function () {
      // nothing to do here
    });
  }

  public goMonitor() {
    this.router.navigateByUrl('/monitor').then(function () {
      // nothing to do here
    });
  }

  public goToUrl(url: string) {
    window.open(url, '_blank');
  }

}


