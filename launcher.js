const Turbine = require('./index.js');
let turbine = new Turbine({
  app: {
    name: "Awesome DB ✊"
  }
});
const client = turbine.client();


