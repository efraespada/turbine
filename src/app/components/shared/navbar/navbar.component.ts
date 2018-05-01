import { Component, OnInit } from '@angular/core';
import { DataService, User } from "../../../services/DataService";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  _user: User = null;

  constructor( private _dataService: DataService) {

  }

  async ngOnInit() {
      let user = await this._dataService.getUser();
      if (user) {
        console.log("nav logged with: " + user.getName())
      } else {
        console.log("nav not logged")
      }
  }

}
