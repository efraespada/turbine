import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import * as $ from 'jquery';
import {MatDrawer, MatSidenav} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showFiller = false;
  navMode = 'side';

  public links = [];

  @ViewChild('drawer') matDrawer: MatDrawer;

  constructor(
  ) {
    let console = {
      name: "Console",
      description: "Test request",
      icon: "http",
      click: () => {

      }
    };
    this.links.push(console);
  }


  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 500) {
      this.matDrawer.close();
    }
    if (event.target.innerWidth > 500) {
      this.matDrawer.open();
    }
  }

}
