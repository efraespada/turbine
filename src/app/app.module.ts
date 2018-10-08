import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSidenavModule, MatMenuModule, MatIconModule,
  MatListModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule } from '@angular/material';



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
import { AdminBodyComponent } from './components/admin-body/admin-body.component';
import { ErrorBodyComponent } from './components/error-body/error-body.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginBodyComponent,
    SplashBodyComponent,
    ConsoleBodyComponent,
    ProfileBodyComponent,
    AdminBodyComponent,
    ErrorBodyComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    APP_ROUTING
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  providers: [
    AngularFireAuth,
    GoogleAuthService,
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
