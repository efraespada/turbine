import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatSidenavModule,
  MatMenuModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatChipsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatFormFieldModule,
  MatInputModule, MatAutocompleteModule, MatTabsModule
} from '@angular/material';



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
import {RouterService} from "./services/router/router.service";
import {MessagesService} from "./services/messages/messages.service";


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
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
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
    MatInputModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  providers: [
    AngularFireAuth,
    GoogleAuthService,
    RouterService,
    ApiService,
    MessagesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
