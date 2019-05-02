import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {auth, User} from "firebase";
import Auth = auth.Auth;
import {first} from "rxjs/operators";
import {OperatorFunction} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {

  private authState: User = null;
  private gParams: any = {
    'login_hint': 'your_mail@gmail.com',
    'access_type': 'offline',
    'include_granted_scopes': 'true'
  };

  constructor(public afAuth: AngularFireAuth) {
    // nothing to do here
  }

  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  get currentUser(): User {
    return this.authenticated ? this.authState : null;
  }

  set currentUser(value: User) {
    this.authState = value;
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
    provider.setCustomParameters(this.gParams);

    //this.afAuth.auth.signInWithPopup(provider).then(() => {});
    this.afAuth.auth.setPersistence(Auth.Persistence.LOCAL).then(() => {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      return this.afAuth.auth.signInWithRedirect(provider);
    }).catch(function(error) {
      let errorCode = error.code;
      let errorMessage = error.message;
    });
  }

  async asyncLogin() {
    let provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('openid');
    provider.setCustomParameters(this.gParams);
    try {
      await this.afAuth.auth.setPersistence(Auth.Persistence.LOCAL);
      return await this.afAuth.auth.signInWithRedirect(provider);
    } catch (e) {
      console.error(e);
      return null;
    }

  }

  async verifySession() {
    try {
      let f: OperatorFunction<User, User> = first();
      this.authState = await this.afAuth.authState.pipe(f).toPromise();
      if (this.authState !== null) {
        console.log(this.authState.email)
      } else {
        console.log("not connected")
      }
    } catch (e) {
      console.error(e)
    }
  }

  async logout() {
    if (this.authenticated) {
      await this.afAuth.auth.signOut()
    }
  }

  status(callback) {
    this.afAuth.authState.subscribe(() => {
      callback();
    });
  }

}
