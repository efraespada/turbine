const forever = require('forever-monitor');
const rp = require('request-promise');
const logjs = require('logjsx');
const logger = new logjs();

function Turbine(callback) {

    this.callback = callback;
    this.turbine_ip = "http://localhost";
    this.turbine_port = 7285;
    this.db_name = "database";
    this.uid = "turbine";
    this.turbine_mode = "simple";
    this.log_dir = "";
    this.debug = false;

    if (this.callback.config !== undefined) {
        if (this.callback.config.db_name !== undefined && this.callback.config.db_name.length > 0) {
            this.db_name = this.callback.config.db_name;
        }
        if (this.callback.config.turbine_port !== undefined && this.callback.config.turbine_port > 0) {
            this.turbine_port = this.callback.config.turbine_port;
        }
        if (this.callback.config.turbine_ip !== undefined) {
            this.turbine_ip = this.callback.config.turbine_ip;
        }
        if (this.callback.config.debug !== undefined && this.callback.config.debug) {
            this.debug = this.callback.config.debug;
        }
        if (this.callback.config.log_dir !== undefined && this.callback.config.log_dir) {
            this.log_dir = this.callback.config.log_dir;
        }
        if (this.callback.config.turbine_mode !== undefined && this.callback.config.turbine_mode) {
            this.turbine_mode = this.callback.config.turbine_mode;
        }
    }

    if (this.debug) {
        logger.init({
            level: "DEBUG"
        });
    }

    /**
     * Initializes Turbine process
     * @param callback
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

            args: ['DATABASE_NAME=' + this.db_name, 'TURBINE_PORT=' + this.turbine_port, 'MODE=' + this.turbine_mode, 'DEBUG=' + this.debug.toString()],

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
     * @param path
     * @returns {Promise<*>}
     */
    this.get = async function(path) {
        let data = {
            method: "get",
            path: path
        };
        return await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

    /**
     * Stores data in the given path. Removes if data is null or empty
     * @param path
     * @param value
     * @returns {Promise<void>}
     */
    this.post = async function(path, value) {
        let data = {
            method: "post",
            path: path,
            value: value
        };
        await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

    /**
     * Returns a list of objects that contains the given fields and values
     * @param path -> /users/*
     * @param query -> { name: "Mark" }
     * @returns {Promise<*>}
     */
    this.query = async function(path, query) {
        let data = {
            method: "query",
            path: path,
            query: query
        };
        return await this.ask(this.turbine_ip + ":" + this.turbine_port + "/", data)
    };

}

module.exports = Turbine;