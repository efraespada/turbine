import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from "@angular/material";
import {ApiService} from "./services/api/api.service";
import {BasicConfigCallback} from "./services/api/basic_config_callback";
import {BasicConfig} from "./services/api/basic_config";
import {Router} from "@angular/router";
import {GoogleAuthService} from "./services/google-auth/google-auth.service";
import {RouterService} from "./services/router/router.service";
import {DatabasesInfoCallback} from "./services/api/databases_info_callback";
import {MessagesService} from "./services/messages/messages.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  navMode = 'side';
  basicConfig: BasicConfig;
  visible: boolean = false;
  siging_out: boolean;
  databases;

  public links = [];

  @ViewChild('drawer') matDrawer: MatDrawer;

  constructor(public routerService: RouterService, public router: Router, public api: ApiService,
              public gService: GoogleAuthService, public messagesService: MessagesService) {
    this.databases = [];
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
        location.href.indexOf("/admin") > -1 || location.href.indexOf("/notification") > -1);
    });
  }


  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
    this.gService.update((logged) => {
      if (!logged && !this.siging_out) {
        this.routerService.goSplash()
      } else if (logged) {
        let view = this;
        this.api.getDatabaseInfo(new class implements DatabasesInfoCallback {
          info(data: any) {
            view.databases = [];
            let databases_name = Object.keys(data);
            for (let name in databases_name) {
              console.log("name: " + JSON.stringify(data[databases_name[name]]));
              let collection_keys = Object.keys(data[databases_name[name]].collections);
              let size = 0;
              for (let i in collection_keys) {
                size += data[databases_name[name]].collections[collection_keys[i]].length
              }
              data[databases_name[name]].collections = collection_keys.length;
              data[databases_name[name]].total_size = size;
              view.databases.push(data[databases_name[name]])
            }
          }
          error(error: string) {
            view.messagesService.currentMessage = "Error getting databases info: " + error;
            view.routerService.goError()
          }
        })
      }
    }, location, "")
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

  logout() {
    this.siging_out = true;
    this.gService.logout(true)
  }

}
