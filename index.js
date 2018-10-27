const forever = require('forever-monitor');
const logjs = require('logjsx');
const TClient = require('./model/client');
const fs = require('fs');
const path = require('path');
const logger = new logjs();
const DEFAULT_CONFIG = {
  "server": {
    "databases": [
      "database",
      "sample"
    ],
    "debug": true,
    "protect": true,
    "auto_start": true,
    "port": 4005,
    "ip": "http://localhost",
    "log_dir": "logs/"
  },
  "app": {
    "production": true,
    "name": "Turbine",
    "toolbar_text_color": "#f5f5f5",
    "toolbar_background_color": "#0075cd",
    "image": "https://github.com/efraespada/turbine/raw/feature/app/src/assets/icon_512.png",
    "firebase": {
      "apiKey": "AIzaSyAtx8E_xHmqWFh66Ru96I5XvaKJehlmC8s",
      "authDomain": "turbine-ide.firebaseapp.com",
      "databaseURL": "https://turbine-ide.firebaseio.com",
      "projectId": "turbine-ide",
      "storageBucket": "turbine-ide.appspot.com",
      "messagingSenderId": "440386510312"
    }
  }
};

logger.init({
  level: "DEBUG"
});

function Turbine(config) {

  this.config = config || DEFAULT_CONFIG;
  this.turbine_process = null;
  if (this.debug) {
    logger.init({
      level: "DEBUG"
    });
  }

  /**
   * Initializes Turbine process
   */
  this.server = () => {
    let process = "server";

    let turbine_config = {
      silent: false,
      uid: process,
      pidFile: "./" + process + ".pid",
      max: 10,
      killTree: true,

      minUptime: 2000,
      spinSleepTime: 1000,

      sourceDir: __dirname,

      args: ['CONFIG=' + JSON.stringify(this.config)],

      watch: false,
      watchIgnoreDotFiles: null,
      watchIgnorePatterns: null,
      watchDirectory: null,

      logFile: __dirname + "/" + this.config.server.log_dir + process + "/logFile.log",
      outFile: __dirname + "/" + this.config.server.log_dir + process + "/outFile.log",
      errFile: __dirname + "/" + this.config.server.log_dir + process + "/errFile.log"
    };

    let c = this.config.app;
    c.ip = this.config.server.ip;
    c.port = this.config.server.port;

    this.prepareConfigFiles(c, () => {
      this.createDir(this.config.server.log_dir + process + "/").then(() => {
        this.turbine_process = forever.start('./turbine.js', turbine_config);
      });
    });
  };

  this.stopServer = () => {
    this.turbine_process.stop();
  };

  this.prepareConfigFiles = (config, callback) => {
    let content = JSON.stringify(config);
    this.writeFile(__dirname + "/dist/turbine-app/assets/config.json", content, (err) => {
      let devPath = __dirname + "/src/assets";
      if (fs.existsSync(devPath)) {
        this.writeFile(devPath + "/config.json", content, (err) => {
          callback()
        });
      } else {
        callback();
      }
    });
  };

  this.writeFile = (path_file, content, callback) => {
    fs.writeFile(path_file, content, callback);
  };

  this.createDir = async (dirPath) => {
    if (!await fs.existsSync(dirPath)) {
      try {
        await fs.mkdirSync(dirPath);
      } catch (e) {
        await this.createDir(path.dirname(dirPath));
        await this.createDir(dirPath);
      }
    }
  };

  this.client = () => {
    return new TClient(this.config.server)
  };

  if (this.config.server.auto_start) {
    this.server()
  }
}

module.exports = Turbine;
