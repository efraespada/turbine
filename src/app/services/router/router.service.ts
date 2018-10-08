import {Injectable} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor(public router: Router) {
    // nothing to do here
  }

  public goSplash() {
    this.router.navigateByUrl('/splash').then(function () {
      console.log("splash");
    });
  }

  public goLogin() {
    this.router.navigateByUrl('/login').then(function () {
      console.log("login");
    });
  }

  public goConsole() {
    this.router.navigateByUrl('/console').then(function () {
      console.log("console");
    });
  }

  public goAdmin() {
    this.router.navigateByUrl('/admin').then(function () {
      console.log("admin");
    });
  }

  public goError() {
    this.router.navigateByUrl('/notification').then(function () {
      console.log("notification");
    });
  }

}


