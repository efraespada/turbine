const JsonDB = require('node-json-db');
const logjs = require('logjsx');
const logger = new logjs();
const SLASH = "/";
logger.init({
  level: "DEBUG"
});

function ApplicationProfile() {

  this.config = null;

  /**
   * Tries to start administrators configuration.
   */
  this.init = () => {
    try {
      let data = new JsonDB("application_profile", true, true);
      this.config = data.getData(SLASH);
      logger.info("application profile found")
    } catch (e) {
      // no admins
      this.config = null;
    }
  };

  /**
   * Returns basic application info
   * @returns {null|*}
   */
  this.getConfig = () => {
    return this.config;
  };

}

module.exports = ApplicationProfile;
