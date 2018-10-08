import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import {auth} from "firebase";
import {ApiService} from "../api/api.service";
import {CreateAdminCallback} from "../api/create_admin_callback";
import {BasicConfigCallback} from "../api/basic_config_callback";
import {BasicConfig} from "../api/basic_config";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material";

@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {

  authState: any = null;

  constructor(public afAuth: AngularFireAuth, private api: ApiService, public router: Router, public snackBar: MatSnackBar) {
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
    this.afAuth.auth.signInWithPopup(provider).then((result) => {
      // nothing to do here
    }).catch(function(error) {
      // nothing to do here
    });
  }

  createAdmin() {
    if (this.authenticated) {
      let gas = this;
      this.api.createAdmin(this.afAuth.auth.currentUser, new class implements CreateAdminCallback {
        created() {
          gas.snackBar.open('Administrator created 👍',null, {
            duration: 2000
          });
          setTimeout(() => {
            gas.api.cleanCache();
            gas.api.getBasicInfo(new class implements BasicConfigCallback {
              basicConfig(basicConfig: BasicConfig) {
                if (basicConfig.mode === "first_run") {
                  console.error("still in first mode")
                }  else {
                  gas.logout();
                  gas.goLogin()
                }
              }
              error(error: string) {
                gas.logout();
                gas.goSplash()
              }
            });
          }, 1000);
        }
        error(error: string) {
          gas.logout();
          gas.goSplash()
        }
      });
    }
  }

  logout() {
    if (this.afAuth.auth.currentUser !== null && this.afAuth.auth.currentUser !== undefined) {
      this.afAuth.auth.signOut().then((result) => {
        // nothing to do here
      }).catch((error) => {
        // nothing to do here
      });
    }
  }

  private goSplash() {
    this.router.navigateByUrl('/splash').then(function () {
      console.log("splash");
    });
  }

  private goLogin() {
    this.router.navigateByUrl('/login').then(function () {
      console.log("login");
    });
  }

}
