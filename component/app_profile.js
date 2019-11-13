
function ApplicationProfile(config) {

  this.config = config;

  /**
   * Returns basic application info
   * @returns {null|*}
   */
  this.getConfig = () => {
    return this.config;
  };

}

module.exports = ApplicationProfile;
