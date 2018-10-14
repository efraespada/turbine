import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import 'hammerjs';
import {environment} from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

fetch('/assets/config.json').then(resp => resp.json()).then(config => {
  window['firebase_config'] = config.firebase;
  window['config'] = config;
  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
});

// platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));

