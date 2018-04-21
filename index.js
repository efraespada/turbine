const forever = require('forever-monitor');
const rp = require('request-promise');
const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

function Turbine(config) {

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

        let config = {
            silent: false,
            uid: this.uid,
            pidFile: "./" + this.uid + ".pid",
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


            logFile: __dirname + "/" + this.log_dir + "logFile.log",
            outFile: __dirname + "/" + this.log_dir + "outFile.log",
            errFile: __dirname + "/" + this.log_dir + "errFile.log"
        };

        let child = forever.start('./turbine.js', config);
        child.on('start', function (code) {
            logger.debug(config.args);
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
     * @returns {Promise<*>}
     */
    this.get = async function(database, path) {
        let data = {
            method: "get",
            database: database,
            path: path
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
        await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

    /**
     * Returns a list of objects that contains the given fields and values
     * @param database -> myDatabase
     * @param path -> /users/*
     * @param query -> { name: "Mark" }
     * @returns {Promise<*>}
     */
    this.query = async function(database, path, query) {
        let data = {
            method: "query",
            database: database,
            path: path,
            query: query
        };
        return await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

}

module.exports = Turbine;