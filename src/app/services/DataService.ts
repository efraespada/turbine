import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from "@angular/router";
import {async} from "rxjs/scheduler/async";

@Injectable()
export class DataService {

    private _user: User = null;

    constructor(private _router: Router, public afAuth: AngularFireAuth) {
    }

    login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout() {
        this._user = null;
        this.afAuth.auth.signOut();
    }

    private getUserPrim = () => {
        return new Promise(function (resolve, reject) {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                  resolve(user);
                } else {
                  reject(Error('Not logged'));
                }
            });
        });
    };

    getUser = async () => {
        if (this._user) {
            return this._user;
        } else {
            let u = await this.getUserPrim();
            if (u) {
                this._user = new User(u)
                return this._user;
            } else {
                return null
            }
        }
    }

}

export class User {

    private name: string;

    private photoUrl: string;

    private uid: string;

    private email: string;

    constructor(data) {
        this.name = data.displayName;
        this.photoUrl = data.photoURL;
        this.uid = data.uid;
        this.email = data.email;
    }

    getName = () => this.name;

    getEmail = () => this.email;

    getPhoto = () => this.photoUrl;

    getUid = () => this.uid
}
