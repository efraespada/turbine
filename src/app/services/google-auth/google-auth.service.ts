import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {auth} from "firebase";
import UserCredential = firebase.auth.UserCredential;


@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {

  private authState: any = null;

  constructor(public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }

  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }

  // Returns
  get currentUserObservable(): any {
    return this.afAuth.authState
  }

  // Returns current user UID
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  login() {
    let provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('openid');
    provider.setCustomParameters({
      'login_hint': 'your_mail@gmail.com'
    });

    this.afAuth.auth.signInWithPopup(provider).then(() => {});
  }

  logout() {
    if (this.authenticated) {
      this.afAuth.auth.signOut().then(() => {});
    }
  }

  status(callback) {
    this.afAuth.authState.subscribe(() => {
      callback();
    });
  }

}
