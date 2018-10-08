import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api/api.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";
import {RouterService} from "../../services/router/router.service";

@Component({
  selector: 'app-splash-body',
  templateUrl: './splash-body.component.html',
  styleUrls: ['./splash-body.component.css']
})

export class SplashBodyComponent implements OnInit {

  static TAG: string = 'splash';

  constructor(public gService: GoogleAuthService, public router: RouterService, public api: ApiService) {
    // nothing to do here
  }

  ngOnInit() {
    setTimeout(() => {
      let r = this.router;
      let g = this.gService;
      this.api.getBasicInfo(new class implements BasicConfigCallback {
        basicConfig(basicConfig: BasicConfig) {
          g.update((logged) => {
            if (basicConfig.mode === "first_run") {
              r.goAdmin();
            } else if (!logged) {
              r.goLogin();
            } else {
              r.goConsole()
            }
          }, location, SplashBodyComponent.TAG);
        }

        error(error: string) {
          r.goError()
        }
      });
    }, 2000);
  }

}


