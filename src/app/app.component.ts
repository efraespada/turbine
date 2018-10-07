import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from "@angular/material";
import {ApiService} from "./services/api/api.service";
import {BasicConfigCallback} from "./services/api/basic_config_callback";
import {BasicConfig} from "./services/api/basic_config";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  navMode = 'side';
  basicConfig: BasicConfig;
  visible: boolean = false;

  public links = [];

  @ViewChild('drawer') matDrawer: MatDrawer;

  constructor(router: Router, public api: ApiService) {
    let csl = {
      name: "Console",
      description: "Test request",
      icon: "http",
      click: () => {

      }
    };
    let component = this;
    this.links.push(csl);

    this.api.getBasicInfo(new class implements BasicConfigCallback {
      basicConfig(basicConfig: BasicConfig) {
        component.basicConfig = basicConfig;
      }
      error(error: string) {
        console.error(error)
      }
    });
    router.events.subscribe((val) => {
      this.visible = !(location.href.indexOf("/splash") > -1 || location.href.indexOf("/login") > -1 ||
        location.href.indexOf("/admin") > -1 || location.href.indexOf("/error") > -1);
    });
  }


  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 500 && this.matDrawer !== undefined) {
      this.matDrawer.close();
    }
    if (event.target.innerWidth > 500 && this.matDrawer !== undefined) {
      this.matDrawer.open();
    }
  }

  headerColor() {
    return {
      'background-color':  (this.basicConfig !== null && this.basicConfig !== undefined) ? this.basicConfig.toolbar_color : "#f5f5f5"
    }
  }

}
