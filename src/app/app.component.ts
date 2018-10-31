import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDrawer} from "@angular/material";
import {DatabasesInfoCallback} from "./services/api/databases_info_callback";
import {MessagesService} from "./services/messages/messages.service";
import {NewDatabaseDialogComponent} from "./components/new-database-dialog/new-database-dialog.component";
import {AppConfigService} from "./services/app-config/app.config.service";
import {SessionService} from "./services/session/session.service";
import {DataService} from "./services/data/data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  navMode = 'side';
  visible: boolean = false;
  siging_out: boolean;

  _name = AppConfigService.settings.name;

  public links = [];

  @ViewChild('drawer') matDrawer: MatDrawer;

  constructor(private session: SessionService, private data: DataService, private messagesService: MessagesService, private dialog: MatDialog) {
    let csl = {
      name: "Console",
      description: "Test request",
      icon: "http",
      path: "['console']",
      click: () => {
        session.navigation.goConsole()
      }
    };
    let mon = {
      name: "Monitor",
      description: "Live chart",
      icon: "show_chart",
      path: "['monitor']",
      click: () => {
        session.navigation.goMonitor()
      }
    };
    this.links.push(csl);
    this.links.push(mon);
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
      'color':  (AppConfigService.settings.toolbar_text_color !== undefined) ? AppConfigService.settings.toolbar_text_color : "#4a4a4a",
      'background-color':  (AppConfigService.settings.toolbar_background_color !== undefined) ? AppConfigService.settings.toolbar_background_color : "#f5f5f5"
    }
  }

  imgProfile() {
    return {
      'background-image':  "url(" + ((this.session.google.currentUser != null
        && this.session.google.currentUser.photoURL !== undefined && this.session.google.currentUser.photoURL !== null) ?
        this.session.google.currentUser.photoURL : "https://material.angular.io/assets/img/examples/shiba1.jpg") + ")"
    }
  }

  logout() {
    this.siging_out = true;
    this.session.google.logout()
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewDatabaseDialogComponent, {
      width: '250px',
      data: {name: "sample"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.data.createDatabase(result).then(() => {
          // TODO show snackbar
        })
      }
    });
  }

}
