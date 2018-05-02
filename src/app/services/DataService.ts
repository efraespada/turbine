import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from "@angular/router";
import {async} from "rxjs/scheduler/async";

@Injectable()
export class DataService {

    constructor(private _router: Router, public afAuth: AngularFireAuth) {

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
