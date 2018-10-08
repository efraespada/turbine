import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../../services/messages/messages.service";
import {RouterService} from "../../services/router/router.service";
import {BasicConfigCallback} from "../../services/api/basic_config_callback";
import {BasicConfig} from "../../services/api/basic_config";
import {ApiService} from "../../services/api/api.service";

@Component({
  selector: 'app-error-body',
  templateUrl: './error-body.component.html',
  styleUrls: ['./error-body.component.css']
})

export class ErrorBodyComponent implements OnInit {

  static TAG: string = "notification";
  basicConfig: BasicConfig;

  constructor(public messages: MessagesService, public router: RouterService, public api: ApiService) {
    // nothing to do here
  }

  ngOnInit() {
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

}
