
export interface IAppConfig {
  production: boolean;
  turbine_port: number;
  turbine_ip: string;
  name: string;
  toolbar_color: string;
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
