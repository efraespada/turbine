import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDrawer} from "@angular/material";
import {ApiService} from "./services/api/api.service";
import {BasicConfigCallback} from "./services/api/basic_config_callback";
import {BasicConfig} from "./services/api/basic_config";
import {Router} from "@angular/router";
import {GoogleAuthService} from "./services/google-auth/google-auth.service";
import {RouterService} from "./services/router/router.service";
import {DatabasesInfoCallback} from "./services/api/databases_info_callback";
import {MessagesService} from "./services/messages/messages.service";
import {NewDatabaseDialogComponent} from "./components/new-database-dialog/new-database-dialog.component";
import {AppConfigService} from "./services/app-config/app.config.service";

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

  _name = AppConfigService.settings.name;

  public links = [];

  @ViewChild('drawer') matDrawer: MatDrawer;

  constructor(public routerService: RouterService, public router: Router, public api: ApiService,
              public gService: GoogleAuthService, public messagesService: MessagesService,
              public dialog: MatDialog) {
    let csl = {
      name: "Console",
      description: "Test request",
      icon: "http",
      path: "['console']",
      click: () => {
        this.routerService.goConsole()
      }
    };
    let mon = {
      name: "Monitor",
      description: "Live chart",
      icon: "show_chart",
      path: "['monitor']",
      click: () => {
        this.routerService.goMonitor()
      }
    };
    let component = this;
    this.links.push(csl);
    this.links.push(mon);

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
      } else if (logged && this.api._config.mode !== "first_run") {
        let view = this;
        this.api.getDatabaseInfo(new class implements DatabasesInfoCallback {
          info(data: any) {
            // nothing to do here
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
      'background-color':  (AppConfigService.settings.toolbar_color !== undefined) ? AppConfigService.settings.toolbar_color : "#f5f5f5"
    }
  }

  logout() {
    this.siging_out = true;
    this.gService.logout(true)
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewDatabaseDialogComponent, {
      width: '250px',
      data: {name: "sample"}
    });

    let view = this;

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.api.createDatabase(result, new class implements DatabasesInfoCallback {
          info(data: any) {
            view.api.getDatabaseInfo(new class implements DatabasesInfoCallback {
              info(data: any) {
                // nothing to do here
              }
              error(error: string) {
                view.messagesService.currentMessage = "Error getting databases info: " + error;
                view.routerService.goError()
              }
            })
          }
          error(error: string) {
            view.messagesService.currentMessage = "Error getting databases info: " + error;
            view.routerService.goError()
          }
        })
      }
    });
  }

}
