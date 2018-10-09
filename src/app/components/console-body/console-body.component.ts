import {Component, OnInit, ViewChild} from '@angular/core';
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";
import {RouterService} from "../../services/router/router.service";
import {MessagesService} from "../../services/messages/messages.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-console-body',
  templateUrl: './console-body.component.html',
  styleUrls: ['./console-body.component.css']
})
export class ConsoleBodyComponent implements OnInit {

  static TAG: string = "console";
  options: string[] = ['GET', 'QUERY', 'POST'];
  myControl = new FormControl();

  constructor(public router: RouterService, public gService: GoogleAuthService, public messages: MessagesService) {
    // nothing to do here
  }

  ngOnInit() {
    this.gService.update((logged) => {
      if (!logged) {
        // nothing to do here (yet)
      }
    }, location, ConsoleBodyComponent.TAG)
  }

}
