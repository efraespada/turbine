import {Component, OnInit} from '@angular/core';
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";
import {RouterService} from "../../services/router/router.service";

@Component({
  selector: 'app-login-body',
  templateUrl: './login-body.component.html',
  styleUrls: ['./login-body.component.css']
})
export class LoginBodyComponent implements OnInit {

  static TAG: string = "login";

  constructor(public service: GoogleAuthService, public router: RouterService) {
    // nothing to do here
  }

  ngOnInit() {
    this.service.update((logged) => {
      if (logged) {
        this.router.goConsole();
      } else {
        this.service.login(false);
      }
    }, location, LoginBodyComponent.TAG);
  }

}
