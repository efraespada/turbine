const Turbine = require('./index.js');
let turbine = new Turbine({
  app: {
    production: false,
    name: "Awesome DB ✊"
  },
  server: {
    memory: 8192,
    protect: false
  }
});
const client = turbine.client();


