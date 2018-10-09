import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {auth, User} from "firebase";
import {ApiService} from "../api/api.service";
import {CreateAdminCallback} from "../api/create_admin_callback";
import {BasicConfigCallback} from "../api/basic_config_callback";
import {BasicConfig} from "../api/basic_config";
import {MatSnackBar} from "@angular/material";
import {RouterService} from "../router/router.service";
import {MessagesService} from "../messages/messages.service";
import {LoginCallback} from "../api/login_callback";

@Injectable({
  providedIn: 'root'
})

export class GoogleAuthService {

  authState: any = null;
  private _apiKey: string;

  constructor(public afAuth: AngularFireAuth, private api: ApiService, public snackBar: MatSnackBar
    , public router: RouterService, public messages: MessagesService) {
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

  login(adminLogin: boolean) {
    let provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('openid');
    provider.setCustomParameters({
      'login_hint': 'your_mail@gmail.com'
    });

    if (!adminLogin) {
      this.snackBar.open('Login with Google account', null, {
        duration: 2000
      });
    }
    let g = this;
    this.afAuth.auth.signInWithPopup(provider).then((result) => {
      if (!adminLogin) {
        this.internalLogin(result.user);
      }
    }).catch(function (error) {
      // TODO go error page
    });
  }

  private internalLogin(user: User) {
    let g = this;
    this.api.login(user, new class implements LoginCallback {
      apiKey(apiKey: string) {
        g.apiKey = apiKey;
        g.api.apiKey = g.apiKey;
        console.info("apiKey: " + apiKey);
        g.snackBar.open('Welcome back ' + user.displayName, null, {
          duration: 2000
        });
        setTimeout(() => {
          g.router.goConsole();
        }, 2500)
      }

      error(error: string) {
        g.logout(false);
        g.messages.currentMessage = "Error login user: " + error + " [" + error.length + "]";
        g.router.goError()
      }
    });
  }

  createAdmin() {
    if (this.authenticated) {
      let gas = this;
      this.api.createAdmin(this.afAuth.auth.currentUser, new class implements CreateAdminCallback {
        created() {
          gas.snackBar.open('Administrator created 👍', null, {
            duration: 2000
          });
          setTimeout(() => {
            gas.api.cleanCache();
            gas.api.getBasicInfo(new class implements BasicConfigCallback {
              basicConfig(basicConfig: BasicConfig) {
                if (basicConfig.mode === "first_run") {
                  console.error("still in first mode")
                } else {
                  gas.logout(false);
                  gas.router.goLogin()
                }
              }

              error(error: string) {
                gas.messages.currentMessage = "see you soon";
                gas.router.goError()
              }
            });
          }, 1000);
        }

        error(error: string) {
          gas.messages.currentMessage = "see you soon";
          gas.router.goError()
        }
      });
    }
  }

  logout(with_message: boolean) {
    if (this.afAuth.auth.currentUser !== null && this.afAuth.auth.currentUser !== undefined) {
      this.afAuth.auth.signOut().then((result) => {
        //this.router.close();
        if (with_message) {
          this.messages.currentMessage = "Signed out successfully";
          this.router.goError()
        }
      }).catch((error) => {
        if (with_message) {
          this.messages.currentMessage = "Error signing out";
          this.router.goError()
        }
      });
    }
  }

  update(callback, location, tag) {
    this.afAuth.authState.subscribe((auth) => {
      this.api.user = auth;
      if (location.pathname.startsWith("/" + tag))
        callback(auth !== null);
    });
  }


  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(value: string) {
    this._apiKey = value;
  }
}
