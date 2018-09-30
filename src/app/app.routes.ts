import { RouterModule, Routes } from "@angular/router";
import { SplashBodyComponent } from "./components/splash-body/splash-body.component";
import { LoginBodyComponent } from "./components/login-body/login-body.component";
import { ConsoleBodyComponent } from "./components/console-body/console-body.component";

const APP_ROUTES: Routes = [
  { path: 'splash', component: SplashBodyComponent },
  { path: 'login', component: LoginBodyComponent },
  { path: 'console', component: ConsoleBodyComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'splash'}
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
