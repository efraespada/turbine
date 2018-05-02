import { Component, OnInit } from '@angular/core';
import { DataService, User } from "../../../services/DataService";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor( private _dataService: DataService,
               public _authService: AuthService) {

  }

  ngOnInit() {

  }

  logout() {
      this._authService.logout()
  }

}
