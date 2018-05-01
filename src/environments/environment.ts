// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAtx8E_xHmqWFh66Ru96I5XvaKJehlmC8s",
    authDomain: "turbine-ide.firebaseapp.com",
    databaseURL: "https://turbine-ide.firebaseio.com",
    projectId: "turbine-ide",
    storageBucket: "",
    messagingSenderId: "440386510312"
  }
};
