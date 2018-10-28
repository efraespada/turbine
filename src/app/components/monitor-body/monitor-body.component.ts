import {Component, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket/socket.service";

@Component({
  selector: 'app-monitor-body',
  templateUrl: './monitor-body.component.html',
  styleUrls: ['./monitor-body.component.css']
})
export class MonitorBodyComponent implements OnInit {

  static TAG: string = "monitor";

  constructor(private socket: SocketService) {
    console.log("monitor")
  }

  ngOnInit() {
    this.socket.update((data) => {
      console.log("monitor status on socket => " + JSON.stringify(data));
    }, location, MonitorBodyComponent.TAG)
  }

}
