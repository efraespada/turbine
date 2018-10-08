import {RouterModule, Routes} from "@angular/router";
import {SplashBodyComponent} from "./components/splash-body/splash-body.component";
import {LoginBodyComponent} from "./components/login-body/login-body.component";
import {ConsoleBodyComponent} from "./components/console-body/console-body.component";
import {AdminBodyComponent} from "./components/admin-body/admin-body.component";
import {ErrorBodyComponent} from "./components/error-body/error-body.component";

const APP_ROUTES: Routes = [
  {path: SplashBodyComponent.TAG, component: SplashBodyComponent},
  {path: LoginBodyComponent.TAG, component: LoginBodyComponent},
  {path: AdminBodyComponent.TAG, component: AdminBodyComponent},
  {path: ConsoleBodyComponent.TAG, component: ConsoleBodyComponent},
  {path: ErrorBodyComponent.TAG, component: ErrorBodyComponent},
  {path: '**', pathMatch: 'full', redirectTo: SplashBodyComponent.TAG}
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
