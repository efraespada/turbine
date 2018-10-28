const Turbine = require('./index.js');
let turbine = new Turbine({
  app: {
    production: false,
    name: "Awesome DB ✊"
  }
});
const client = turbine.client();


