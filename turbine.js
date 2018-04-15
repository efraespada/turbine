const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const SN = require('sync-node');
const boxen = require('boxen');
const DatabasesManager = require('./model/databasesManager.js');
const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const DATABASE_FOLDER = "data/";
const expectedDBNEnvVar = "DATABASE_NAME";
const expectedTPORTEnvVar = "TURBINE_PORT";
const expectedModeEnvVar = "MODE";
const expectedDebugKeyEnvVar = "DEBUG";

let db_name = null;
let debug = false;
let turbine_port = false;
let mode = "simple";

process.argv.forEach(function (val, index, array) {
    if (val.indexOf(expectedDBNEnvVar) > -1) {
        db_name = val.replaceAll(expectedDBNEnvVar + "=", "");
    }
    if (val.indexOf(expectedDebugKeyEnvVar) > -1) {
        debug = val.replaceAll(expectedDebugKeyEnvVar + "=", "") === "true";
    }
    if (val.indexOf(expectedTPORTEnvVar) > -1) {
        turbine_port = val.replaceAll(expectedTPORTEnvVar + "=", "");
    }
    if (val.indexOf(expectedModeEnvVar) > -1) {
        mode = val.replaceAll(expectedModeEnvVar + "=", "");
    }
});

let config = {
    databases: ["database", "paths"]
};

/**
 * check if given databases has own folder and collections, if not they are created.
 * also loads databases as associative arrays
 * @type {DatabasesManager}
 */
let databaseManager = new DatabasesManager(config);

console.log(boxen('turbine', {padding: 2, borderColor: "cyan", borderStyle: 'round'}));
console.log("starting ..");
const router = express.Router();
const queue = SN.createQueue();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(timeout('120s'));
router.post('/', function (req, res) {
    queue.pushJob(function () {
        if (req.body.method !== undefined && req.body.path !== undefined && req.body.database !== undefined) {
            if (req.body.method === "get") {
                let object = databaseManager.getObject(req.body.database, req.body.path);
                res.json(object)
            } else if (req.body.method === "post" && req.body.value !== undefined) {
                databaseManager.saveObject(req.body.database, req.body.path, req.body.value === null ? null : req.body.value);
                res.json({})
            } else if (req.body.method === "query" && req.body.query !== undefined) {
                let object = databaseManager.getObjectFromQuery(req.body.database, req.body.path, req.body.query);
                res.json(object)
            } else {
                res.status(500).send("💥");
            }
        } else {
            res.status(500).send("💥");
        }
    });
});
app.use('/', router);
app.listen(turbine_port, function () {
    console.log("started on " + turbine_port);
});
