const JsonDB = require('node-json-db');
const logjs = require('logjsx');
const logger = new logjs();
const SLASH = "/";

logger.init({
  level: "DEBUG"
});

function AccessManager() {

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
        logger.info("administrator not found")
      } else {
        logger.info("administrator found")
      }
    } catch (e) {
      // no admins
      this.config = null;
      this.jsondb = null;
      logger.error("no administrator defined");
    }
  };

  /**
   * Validates requests. If turbine is in first run mode, only add_member method is allowed
   * @param params
   * @returns {boolean}
   */
  this.validRequest = (params) => {
    if (this.isFirstRun()) {
      return params.method === "add_member" || params.method === "get_basic_info";
    } else if (params.method === "add_member" || params.method === "get_basic_info") {
      return true
    }

    if (params.token !== null && params.token !== undefined) {
      return Object.keys(this.config).indexOf(params.token) > -1
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

    if (user.uid != null && user.uid !== undefined) {
      if (this.config[user.uid] === undefined) {
        this.config[user.uid] = user;
        logger.info("user " + user.displayName !== undefined ? user.displayName : "" + " successfully")
      } else {
        this.config[user.uid] = user;
        logger.warn("user " + user.displayName !== undefined ? user.displayName : "" + " already exists, updated")
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
