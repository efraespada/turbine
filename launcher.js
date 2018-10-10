const Turbine = require('./index.js');
let turbine = new Turbine(require("./config.json"), require("./application_profile.json"));
turbine.server();
