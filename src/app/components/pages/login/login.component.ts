import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase";
import {Router} from "@angular/router";
import {DataService} from "../../../services/DataService";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private _router: Router, public dataService: DataService) { }

  ngOnInit() {

  }

  login() {
    this.dataService.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
}
