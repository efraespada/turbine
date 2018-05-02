import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";

@Injectable()
export class AuthService {

    user$: Observable<firebase.User>;

    constructor(private _router: Router, private firebaseAuth: AngularFireAuth) {
        this.user$ = firebaseAuth.authState;

        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                _router.navigate(["login"])
            } else if (user && _router.url === "/login") {
                _router.navigate(["home"])
            }
        });
    }

    login() {
        this.firebaseAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout() {
        this.firebaseAuth.auth.signOut();
    }
}
