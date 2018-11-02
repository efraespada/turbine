import {Component, OnInit} from '@angular/core';
import {AppConfigService} from "../../services/app-config/app.config.service";
import {SessionService} from "../../services/session/session.service";

@Component({
  selector: 'app-admin-body',
  templateUrl: './admin-body.component.html',
  styleUrls: ['./admin-body.component.css']
})
export class AdminBodyComponent implements OnInit {

  static TAG: string = "admin";
  _name = AppConfigService.settings.name;

  constructor(public session: SessionService) {
    // nothing to do here
  }

  ngOnInit() {
    // nothing to do here
  }


}
