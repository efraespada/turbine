import {Injectable} from '@angular/core';
import {IAppConfig} from "./i.app.config";

@Injectable({
  providedIn: 'root'
})

export class AppConfigService {

  static settings: IAppConfig;

  constructor() {
    // nothing to do here
  }

  fireConfig() {
    AppConfigService.settings = window['config'];
    console.log(window['firebase_config']);
    return window['firebase_config']
  }

}
