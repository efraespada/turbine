const logjs = require('logjsx');
const setIn = require('set-in');
const pm2 = require('pm2');
const RecursiveIterator = require('recursive-iterator');
const TClient = require('./component/client');
const fs = require('fs');
const path = require('path');
const logger = new logjs();
const {exec} = require('child_process');
const DEFAULT_CONFIG = {
  "server": {
    "databases": [
      "database",
      "sample"
    ],
    "debug": true,
    "protect": true,
    "active": true,
    "auto_start": true,
    "port": 4005,
    "memory": 4096,
    "ip": "http://localhost",
    "log_dir": "logs/",
    "cluster_core": "MacBook Pro (914)",
    "cluster_debug": true
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

  this.turbine_process = "turbine";

  /**
   * Merges the default configuration with the defined in the launcher
   */
  this.mergeConfig = () => {
    this.config = DEFAULT_CONFIG;
    for (let {parent, node, key, path, deep} of new RecursiveIterator(config)) {
      if (typeof node !== "object") {
        setIn(this.config, path, node);
      }
    }
    logger.init({
      level: this.config.server.debug ? "DEBUG" : "INFO"
    });
  };

  /**
   * Initializes Turbine process
   */
  this.server = () => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      if (!this.config.server.active) {
        return;
      }
      let process = "server";

      let c = this.config.app;
      c.ip = this.config.server.ip;
      c.port = this.config.server.port;

      this.prepareConfigFiles(c, () => {
        exec('export NODE_OPTIONS=--max_old_space_size=' + this.config.server.memory, (err, stdout, stderr) => {
          if (err) {
            logger.error("Error defining " + '--max_old_space_size=' + this.config.server.memory);
            return;
          }
          this.createDir(this.config.server.log_dir + process + "/").then(() => {
            pm2.start({
              script: this.turbine_process + '.js',         // Script to be run
              minUptime: 2000,
              kill_timeout : 20000,
              pid: "./" + process + ".pid",
              output: this.config.server.log_dir + process + "/logFile.log",
              error: this.config.server.log_dir + process + "/errFile.err",
              max_memory_restart: '2048M',   // Optional: Restarts your app if it reaches 100Mo
              args: ['CONFIG=' + JSON.stringify(this.config)]
            }, (err, apps) => {
              pm2.disconnect();   // Disconnects from PM2
              if (err) throw err
            });
          });
        });
      });
    });
  };

  this.stopServer = () => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }
      pm2.stop(this.turbine_process, (err, apps) => {
        pm2.disconnect();   // Disconnects from PM2
        if (err) throw err
      })
    });
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

  this.mergeConfig();
  if (this.config.server.auto_start) {
    this.server()
  }

}

exports = module.exports = Turbine;
exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
