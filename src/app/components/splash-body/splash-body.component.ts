import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from "@angular/router";

@Component({
  selector: 'app-splash-body',
  templateUrl: './splash-body.component.html',
  styleUrls: ['./splash-body.component.css'],
  providers: [ AngularFireAuth ]
})

export class SplashBodyComponent implements OnInit {

  constructor(private afAuth: AngularFireAuth, private router: Router){
    // nothing to do here
  }

  ngOnInit() {
    setTimeout( async () => {
      if (this.afAuth.auth.currentUser === null || this.afAuth.auth.currentUser === undefined) {
        this.goLogin()
      } else {
        let token: string = await this.afAuth.auth.currentUser.getIdToken();
        if (token === null || token === undefined) {
          this.goLogin()
        } else {
          this.goConsole()
        }
      }
    }, 2000);

  }

  private goLogin() {
    this.router.navigateByUrl('/login').then(function () {
      console.log("login");
    });
  }

  private goConsole() {
    this.router.navigateByUrl('/console').then(function () {
      console.log("console");
    });
  }

}
