const JsonDB = require('node-json-db');
const sha1 = require('sha1');
const logjs = require('logjsx');
const logger = new logjs();
const SLASH = "/";

function AccessManager(env_config) {

  logger.init({
    level: env_config.debug ? "DEBUG" : "INFO"
  });

  this.jsondb = null;
  this.config = null;

  /**
   * Tries to start administrators configuration.
   */
  this.init = () => {
    try {
      this.jsondb = new JsonDB("access", true, true);
      this.config = this.jsondb.getData(SLASH);
      if (Object.keys(this.config).length == 0) {
        this.config = null;
        logger.info("No administrator found; the access.json file has generated. Open " + env_config.ip + ":" + env_config.port +
          "/app/ to define an administrator");
      }
    } catch (e) {
      // no admins
      this.config = null;
      this.jsondb = null;
      this.writeFile("access.json", "{}", (err) => {
        logger.info("No administrator found; the access.json file has generated. Open " + env_config.ip + ":" + env_config.port +
          "/app/ to define an administrator");
      });
    }
  };

  this.writeFile = (path_file, content, callback) => {
    fs.writeFile(path_file, content, callback);
  };

  /**
   * Validates requests. If turbine is in first run mode, only add_member method is allowed
   * @param params
   * @returns {boolean}
   */
  this.validRequest = (params) => {
    if (this.isFirstRun()) {
      return params.method === "add_member" || params.method === "get_basic_info" || params.method === "login";
    } else if (params.method === "add_member" || params.method === "get_basic_info" || params.method === "login") {
      return true
    }

    if (params.apiKey !== null && params.apiKey !== undefined && params.uid !== null && params.uid !== undefined) {
      return this.config[params.uid] !== undefined && this.config[params.uid].apiKey === params.apiKey;
    } else {
      return false;
    }
  };

  this.getApiKey = (params) => {
    if (params.user !== undefined) {
      let u = JSON.parse(params.user);
      if (u.uid !== undefined && this.config[u.uid] !== undefined) {
        return {apiKey: this.config[u.uid].apiKey};
      } else {
        return null
      }
    } else {
      return null
    }
  };

  this.verifyAccount = (params) => {
    if (this.config === null || this.config === undefined) {
      return false
    }
    if (params.user !== undefined) {
      let u = JSON.parse(params.user);
      if (u !== null && u.uid !== undefined && this.config[u.uid] !== undefined) {
        if (this.config[u.uid].locked !== undefined) {
          u.locked = this.config[u.uid].locked;
        }
        this.addUser(u);
        return (this.config[u.uid].locked === undefined || !this.config[u.uid].locked) &&
          this.config[u.uid].email === u.email;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  /**
   * Adds an admin user
   * @param user
   */
  this.addUser = (user) => {
    let rol = this.isFirstRun() ? "admin" : "collaborator";
    if (this.config === null || this.config === undefined) {
      this.config = {};
    }

    user.rol = rol;
    user.apiKey = sha1(user.uid + user.email + user.apiKey);

    if (user.uid != null && user.uid !== undefined) {
      if (this.config[user.uid] === undefined) {
        this.config[user.uid] = user;
      } else {
        this.config[user.uid] = user;
      }
      if (this.jsondb === null) {
        this.jsondb = new JsonDB("access", true, true);
      }
      this.jsondb.push(SLASH, this.config)
    } else {
      logger.error("not valid user ")
    }
  };

  /**
   * Returns false if there is no admins
   * @returns {boolean}
   */
  this.isFirstRun = () => {
    return this.config === null;
  };

}

module.exports = AccessManager;
