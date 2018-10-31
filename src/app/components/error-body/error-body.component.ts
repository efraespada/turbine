import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../../services/messages/messages.service";
import {AppConfigService} from "../../services/app-config/app.config.service";
import {SessionService} from "../../services/session/session.service";

@Component({
  selector: 'app-error-body',
  templateUrl: './error-body.component.html',
  styleUrls: ['./error-body.component.css']
})

export class ErrorBodyComponent implements OnInit {

  static TAG: string = "notification";
  _name = AppConfigService.settings.name;

  constructor(private session: SessionService, public messages: MessagesService) {
    // nothing to do here
  }

  ngOnInit() {
    // nothing to do here
  }

}
