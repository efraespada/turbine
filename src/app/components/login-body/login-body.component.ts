import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from 'firebase/app';
import { Router } from "@angular/router";
import { GoogleAuthService } from "../../services/google-auth/google-auth.service";

@Component({
  selector: 'app-login-body',
  templateUrl: './login-body.component.html',
  styleUrls: ['./login-body.component.css']
})
export class LoginBodyComponent implements OnInit {

  constructor(private afAuth: AngularFireAuth, private router: Router, public service: GoogleAuthService){
    // nothing to do here
  }

  ngOnInit() {

  }

  login() {
    let provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('openid');
    provider.setCustomParameters({
      'login_hint': 'your_mail@gmail.com'
    });
    this.afAuth.auth.signInWithPopup(provider).then((result) => {
      let user = result.user;
      console.log("user: " + JSON.stringify(user));
      this.service.verifyUser(result.user).then(function (res) {
        console.log(JSON.stringify(res));
      }).catch(function (err) {
        console.error(JSON.stringify(err));
      });
    }).catch(function(error) {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      // The email of the user's account used.
      let email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      let credential = error.credential;
      // ...
      console.log("error login: " + email)
    });
  }

}
