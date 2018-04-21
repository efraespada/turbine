const Turbine = require('./index.js');
let turbine = new Turbine(require("./config.json"));
turbine.server();
