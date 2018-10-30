import {Component, OnInit} from '@angular/core';
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";

@Component({
  selector: 'app-monitor-body',
  templateUrl: './monitor-body.component.html',
  styleUrls: ['./monitor-body.component.css']
})
export class MonitorBodyComponent implements OnInit {

  static TAG: string = "monitor";

  constructor(public gService: GoogleAuthService) {
    console.log("monitor")
  }

  ngOnInit() {
    this.gService.update((logged) => {
      if (logged) {

      }
    }, location, MonitorBodyComponent.TAG);
    this.gService.statusIO(location, MonitorBodyComponent.TAG, (data) => {
      console.log("monitor message: " + JSON.stringify(data));
    });
  }

}
