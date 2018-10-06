import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// routes
import { APP_ROUTING } from "./app.routes";

// components
import { HeaderComponent } from './components/header/header.component';
import { LoginBodyComponent } from './components/login-body/login-body.component';
import { SplashBodyComponent } from './components/splash-body/splash-body.component';
import { ConsoleBodyComponent } from './components/console-body/console-body.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';

// services
import { GoogleAuthService } from "./services/google-auth/google-auth.service";
import { ApiService } from "./services/api/api.service";



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginBodyComponent,
    SplashBodyComponent,
    ConsoleBodyComponent,
    ProfileBodyComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    APP_ROUTING
  ],
  providers: [
    AngularFireAuth,
    GoogleAuthService,
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
