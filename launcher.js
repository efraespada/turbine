const Turbine = require('./index.js');
let turbine = new Turbine({
  app: {
    production: true,
    name: "Awesome DB ✊"
  },
  server: {
    memory: 8192,
    protect: false,
    cluster_debug: true
  }
});
const client = turbine.client();


