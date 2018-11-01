import {Component, OnInit} from '@angular/core';
import {SessionService} from "../../services/session/session.service";

@Component({
  selector: 'app-login-body',
  templateUrl: './login-body.component.html',
  styleUrls: ['./login-body.component.css']
})
export class LoginBodyComponent implements OnInit {

  static TAG: string = "login";

  constructor(public session: SessionService) {
    // nothing to do here
  }

  ngOnInit() {
    // nothing to do here
  }

}
