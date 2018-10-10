import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-monitor-body',
  templateUrl: './monitor-body.component.html',
  styleUrls: ['./monitor-body.component.css']
})
export class MonitorBodyComponent implements OnInit {

  static TAG: string = "monitor";

  constructor() {
    console.log("monitor")
  }

  ngOnInit() {
  }

}
