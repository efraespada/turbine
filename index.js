const forever =             require('forever-monitor');
const rp =                  require('request-promise');
const logjs =               require('logjsx');
const fs =                  require('fs');
const path =                require('path');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

function Turbine(config) {

    let o = this;
    this.config = config;
    this.turbine_ip = "http://localhost";
    this.turbine_port = 7285;
    this.databases = ["myDatabase"];
    this.uid = "turbine";
    this.log_dir = "";
    this.debug = false;

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
    }

    if (this.debug) {
        logger.init({
            level: "DEBUG"
        });
    }

    /**
     * Initializes Turbine process
     */
    this.server = function () {
        let turbine_config = {
            silent: false,
            uid: o.uid,
            pidFile: "./" + o.uid + ".pid",
            max: 10,
            killTree: true,

            minUptime: 2000,
            spinSleepTime: 1000,

            sourceDir: __dirname,

            args: ['DATABASES=' + this.databases, 'TURBINE_PORT=' + this.turbine_port, 'DEBUG=' + this.debug.toString()],

            watch: false,
            watchIgnoreDotFiles: null,
            watchIgnorePatterns: null,
            watchDirectory: null,


            logFile: __dirname + "/logFile.log",
            outFile: __dirname + "/outFile.log",
            errFile: __dirname + "/errFile.log"
        };

        this.createDir(o.log_dir + o.uid + "/").then(function () {
            let child = forever.start('./turbine.js', turbine_config);
        });
    };

    this.ask = function (url, data) {
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
     * Returns the object of the given path
     * @param database -> myDatabase
     * @param path
     * @param interf
     * @returns {Promise<*>}
     */
    this.get = async function(database, path, interf = {}) {
        let data = {
            method: "get",
            database: database,
            path: path,
            interface: interf
        };
        return await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

    /**
     * Stores data in the given path. Removes if data is null or empty
     * @param database -> myDatabase
     * @param path
     * @param value
     * @returns {Promise<void>}
     */
    this.post = async function(database, path, value) {
        let data = {
            method: "post",
            database: database,
            path: path,
            value: value
        };
        let response, err = await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data);
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
    this.query = async function(database, path, query, interf = {}) {
        let data = {
            method: "query",
            database: database,
            path: path,
            query: query,
            mask: interf
        };
        return await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
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
