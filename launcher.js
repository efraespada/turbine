const Turbine = require('./index.js');
let turbine = new Turbine({
  app: {
    production: false,
    name: "Awesome DB ✊"
  },
  server: {
    protect: false
  }
});
const client = turbine.client();


