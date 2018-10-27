
export interface IAppConfig {
  production: boolean;
  port: number;
  ip: string;
  name: string;
  toolbar_text_color: string;
  toolbar_background_color: string;
  image: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
  };
}
