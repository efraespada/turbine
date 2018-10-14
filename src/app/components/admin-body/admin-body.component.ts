import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api/api.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";
import {AppConfigService} from "../../services/app-config/app.config.service";

@Component({
  selector: 'app-admin-body',
  templateUrl: './admin-body.component.html',
  styleUrls: ['./admin-body.component.css']
})
export class AdminBodyComponent implements OnInit {

  static TAG: string = "admin";
  basicConfig: BasicConfig;
  _name = AppConfigService.settings.name;

  constructor(public api: ApiService, public gService: GoogleAuthService) {
    // nothing to do here
  }

  ngOnInit() {
    this.gService.update(() => {
      let component = this;
      this.api.getBasicInfo(new class implements BasicConfigCallback {
        basicConfig(basicConfig: BasicConfig) {
          component.basicConfig = basicConfig;
        }

        error(error: string) {
          console.error(error)
        }
      });
    }, location, AdminBodyComponent.TAG);
  }


}
