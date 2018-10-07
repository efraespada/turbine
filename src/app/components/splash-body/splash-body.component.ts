import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../../services/api/api.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";

@Component({
  selector: 'app-splash-body',
  templateUrl: './splash-body.component.html',
  styleUrls: ['./splash-body.component.css'],
  providers: [
    GoogleAuthService
  ]
})

export class SplashBodyComponent implements OnInit {

  constructor(private gService: GoogleAuthService, private router: Router, public api: ApiService){
    let sbc = this;
    this.api.getBasicInfo(new class implements BasicConfigCallback {
      basicConfig(basicConfig: BasicConfig) {
        if (basicConfig.mode === "first_run") {
          sbc.goAdmin();
        } else if (!gService.authenticated) {
          sbc.goLogin();
        } else {
          sbc.goConsole()
        }
      }
      error(error: string) {
        sbc.goError()
      }
    });
  }

  ngOnInit() {
    // nothing to do here
  }

  private goLogin() {
    this.router.navigateByUrl('/login').then(function () {
      console.log("login");
    });
  }

  private goAdmin() {
    this.router.navigateByUrl('/admin').then(function () {
      console.log("admin");
    });
  }

  private goError() {
    this.router.navigateByUrl('/error').then(function () {
      console.log("error");
    });
  }

  private goConsole() {
    this.router.navigateByUrl('/console').then(function () {
      console.log("console");
    });
  }

}
