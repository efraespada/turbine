const forever = require('forever-monitor');
const rp = require('request-promise');
const express = require('express');
const app = express();
const logjs = require('logjsx');
const fs = require('fs');
const path = require('path');
const logger = new logjs();

logger.init({
  level: "DEBUG"
});


function Turbine(config, application_config) {

  let o = this;
  this.config = config;
  this.application_config = application_config;
  this.turbine_ip = "http://localhost";
  this.turbine_port = 7285;
  this.app_port = 7286;
  this.databases = ["myDatabase"];
  this.log_dir = "logs/";
  this.debug = false;
  this.protected = true;
  this.turbine_process = null;
  this.app_process = null;

  if (this.config !== undefined) {
    if (this.config.databases !== undefined && this.config.databases.length > 0) {
      this.databases = this.config.databases;
    }
    if (this.config.turbine_port !== undefined && this.config.turbine_port > 0) {
      this.turbine_port = this.config.turbine_port;
    }
    if (this.config.turbine_ip !== undefined) {
      this.turbine_ip = this.config.turbine_ip;
    }
    if (this.config.debug !== undefined && this.config.debug) {
      this.debug = this.config.debug;
    }
    if (this.config.log_dir !== undefined && this.config.log_dir) {
      this.log_dir = this.config.log_dir;
    }
    if (this.config.app_port !== undefined && this.config.app_port) {
      this.app_port = this.config.app_port;
    }
    if (this.config.protected !== undefined) {
      this.protected = this.config.protected;
    }
  }

  if (this.debug) {
    logger.init({
      level: "DEBUG"
    });
  }

  this.getRequest = function (url, data) {
    return new Promise(function (resolve, reject) {
      let options = {
        uri: url,
        qs: data,
        json: true
      };
      rp(options)
        .then(function (parsedBody) {
          resolve(parsedBody)
        })
        .catch(function (err) {
          reject(err)
        });
    });
  };

  this.postRequest = function (url, data) {
    return new Promise(function (resolve, reject) {
      let options = {
        method: 'POST',
        uri: url,
        body: data,
        json: true
      };
      rp(options)
        .then(function (parsedBody) {
          resolve(parsedBody)
        })
        .catch(function (err) {
          reject(err)
        });
    });
  };

  /**
   * Initializes Turbine process
   */
  this.server = function () {
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

      args: ['DATABASES=' + this.databases, 'TURBINE_PORT=' + this.turbine_port, 'DEBUG=' + this.debug.toString(),
        'PROTECTED=' + this.protected.toString(),],

      watch: false,
      watchIgnoreDotFiles: null,
      watchIgnorePatterns: null,
      watchDirectory: null,

      logFile: __dirname + "/" + o.log_dir + process + "/logFile.log",
      outFile: __dirname + "/" + o.log_dir + process + "/outFile.log",
      errFile: __dirname + "/" + o.log_dir + process + "/errFile.log"
    };

    this.prepareConfigFiles(this.application_config, () => {
      o.createDir(o.log_dir + process + "/").then(function () {
        o.turbine_process = forever.start('./turbine.js', turbine_config);
        o.startApp(function () {
          logger.info(`Turbine app started (${o.app_port})`);
        });
      });
    });
  };

  this.stopServer = () => {
    this.turbine_process.stop();
    this.app_process.close();
  };

  this.startApp = async function (callback) {
    /*
    app.use('/', express.static(path.join(__dirname, 'dist/turbine-app/')));
    app.all('/*', function(req, res, next) {
      if (req.originalUrl.indexOf(".css/") > -1 || req.originalUrl.indexOf(".js/") > -1 || req.originalUrl.indexOf(".json/") > -1) {
        res.sendFile('dist/turbine-app/' + req.originalUrl.substring(0, req.originalUrl.length - 1) , { root: __dirname });
      } else {
        res.sendFile('dist/turbine-app/index.html' , { root: __dirname });
      }
    });
    o.app_process = app.listen(o.app_port, () => callback());
    */
  };

  this.prepareConfigFiles = function (config, callback) {
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

    /**
   * Returns the object of the given path
   * @param database -> myDatabase
   * @param path
   * @param mask
   * @returns {Promise<*>}
   */
  this.get = async function (database, path, mask = {}) {
    let data = {
      method: "get",
      database: database,
      path: path,
      interface: mask
    };
    return await this.getRequest(this.turbine_ip + ":" + this.turbine_port + "/", data)
  };

  /**
   * Stores data in the given path. Removes if data is null or empty
   * @param database -> myDatabase
   * @param path
   * @param value
   * @returns {Promise<void>}
   */
  this.post = async function (database, path, value) {
    let data = {
      method: "post",
      database: database,
      path: path,
      value: value
    };
    let response, err = await this.postRequest(this.turbine_ip + ":" + this.turbine_port + "/", data);
    if (err) {
      return err
    }
    return response
  };

  /**
   * Returns a list of objects that contains the given fields and values
   * @param database -> myDatabase
   * @param path -> /users/*
   * @param query -> { name: "Mark" }
   * @param interf -> { name: type("string) }
   * @returns {Promise<*>}
   */
  this.query = async function (database, path, query, interf = {}) {
    let data = {
      method: "query",
      database: database,
      path: path,
      query: query,
      mask: interf,
      token: ""
    };
    return await this.getRequest(this.turbine_ip + ":" + this.turbine_port + "/", data)
  };

  this.createDir = async function (dirPath) {
    if (!await fs.existsSync(dirPath)) {
      try {
        await fs.mkdirSync(dirPath);
      } catch (e) {
        await this.createDir(path.dirname(dirPath));
        await this.createDir(dirPath);
      }
    }
  };

}

module.exports = Turbine;
