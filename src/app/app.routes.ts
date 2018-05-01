import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./components/pages/home/home.component";
import { AboutComponent } from "./components/pages/about/about.component";

const APP_ROUTES: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
