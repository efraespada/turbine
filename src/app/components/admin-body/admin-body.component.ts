import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../../services/api/api.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";

@Component({
  selector: 'app-admin-body',
  templateUrl: './admin-body.component.html',
  styleUrls: ['./admin-body.component.css'],
  providers: [
    GoogleAuthService
  ]
})
export class AdminBodyComponent implements OnInit {

  basicConfig: BasicConfig;

  constructor(router: Router, public api: ApiService, public gService: GoogleAuthService) {
    let component = this;
    this.api.getBasicInfo(new class implements BasicConfigCallback {
      basicConfig(basicConfig: BasicConfig) {
        component.basicConfig = basicConfig;
      }
      error(error: string) {
        console.error(error)
      }
    });
  }

  ngOnInit() {
  }


}
