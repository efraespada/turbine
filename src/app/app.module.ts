import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// routes
import { APP_ROUTING } from "./app.routes";

// components
import { HeaderComponent } from './components/header/header.component';
import { LoginBodyComponent } from './components/login-body/login-body.component';
import { SplashBodyComponent } from './components/splash-body/splash-body.component';
import { ConsoleBodyComponent } from './components/console-body/console-body.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';


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
    APP_ROUTING
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
