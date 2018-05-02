import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from 'angularfire2';


import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { HomeComponent } from './components/pages/home/home.component';
import { AboutComponent } from './components/pages/about/about.component';

import { environment } from '../environments/environment';
import { APP_ROUTING } from "./app.routes";
import { DataService } from "./services/DataService";
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginComponent } from './components/pages/login/login.component';
import {AuthService} from "./services/auth.service";


@NgModule({
  declarations: [
      AppComponent,
      NavbarComponent,
      HomeComponent,
      AboutComponent,
      LoginComponent
  ],
  imports: [
      BrowserModule,
      AngularFireModule.initializeApp(environment.firebase),
      APP_ROUTING
  ],
  providers: [
      AuthService,
      DataService,
      AngularFireAuth
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
