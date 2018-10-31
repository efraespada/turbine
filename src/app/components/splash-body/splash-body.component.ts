import {Component, OnInit} from '@angular/core';
import {SessionService} from "../../services/session/session.service";

@Component({
  selector: 'app-splash-body',
  templateUrl: './splash-body.component.html',
  styleUrls: ['./splash-body.component.css']
})

export class SplashBodyComponent implements OnInit {

  static TAG: string = 'splash';

  constructor(public session: SessionService) {
    // nothing to do here
  }

  ngOnInit() {
    // nothing to do here
  }

}


