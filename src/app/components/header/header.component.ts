import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../../services/api/api.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  public visible: boolean = false;
  public api: ApiService;
  public basicConfig: BasicConfig = null;

  constructor(router: Router, api: ApiService) {
    this.api = api;
    router.events.subscribe((val) => {
      this.visible = !(location.href.indexOf("/splash") > -1 || location.href.indexOf("/login") > -1);
      this.ngOnInit()
    });
  }

  ngOnInit() {
    if (this.basicConfig === null) {
      let header = this;
      this.api.getBasicInfo(new class implements BasicConfigCallback {
        basicConfig(basicConfig: BasicConfig) {
          header.basicConfig = basicConfig;
          console.log("header config: " + JSON.stringify(basicConfig))
          header.ngOnInit()
        }
        error(error: string) {
          console.error(error)
        }
      })
    } else {
      // config ready
    }

  }

}
