import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
  MatInputModule, MatAutocompleteModule, MatTabsModule, MatDialogModule, MatSelectModule
} from '@angular/material';

import {AppComponent} from './app.component';
import {AngularFireModule, FirebaseOptionsToken} from '@angular/fire';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/auth';

// routes
import {APP_ROUTING} from "./app.routes";

// components
import {LoginBodyComponent} from './components/login-body/login-body.component';
import {SplashBodyComponent} from './components/splash-body/splash-body.component';
import {ConsoleBodyComponent} from './components/console-body/console-body.component';
import {ProfileBodyComponent} from './components/profile-body/profile-body.component';

// services
import {GoogleAuthService} from "./services/google-auth/google-auth.service";
import {ApiService} from "./services/api/api.service";
import {AdminBodyComponent} from './components/admin-body/admin-body.component';
import {ErrorBodyComponent} from './components/error-body/error-body.component';
import {RouterService} from "./services/router/router.service";
import {MessagesService} from "./services/messages/messages.service";
import {MonitorBodyComponent} from './components/monitor-body/monitor-body.component';
import {NewDatabaseDialogComponent} from './components/new-database-dialog/new-database-dialog.component';
import {FormsModule} from "@angular/forms";
import {AppConfigService} from "./services/app-config/app.config.service";
import {APP_BASE_HREF} from "@angular/common";

export function initializeApp(appConfig: AppConfigService) {
  return appConfig.fireConfig()
}

@NgModule({
  declarations: [
    AppComponent,
    LoginBodyComponent,
    SplashBodyComponent,
    ConsoleBodyComponent,
    ProfileBodyComponent,
    AdminBodyComponent,
    ErrorBodyComponent,
    MonitorBodyComponent,
    NewDatabaseDialogComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatDialogModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    APP_ROUTING
  ],
  exports: [
    FormsModule,
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
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  providers: [
    AppConfigService,
    {provide: FirebaseOptionsToken, deps: [AppConfigService], useFactory: initializeApp},
    {provide: APP_BASE_HREF, useValue: '/app'},
    GoogleAuthService,
    RouterService,
    ApiService,
    MessagesService
  ],
  entryComponents: [
    NewDatabaseDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
