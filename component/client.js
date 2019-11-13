const rp = require('request-promise');

function TClient(config) {

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
    return await this.getRequest(config.ip + ":" + config.port + "/database", data)
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
    let response, err = await this.postRequest(config.ip + ":" + config.port + "/database", data);
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
    return await this.getRequest(config.ip + ":" + config.port + "/database", data)
  };

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

}

module.exports = TClient;

