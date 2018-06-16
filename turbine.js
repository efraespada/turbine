const express =             require('express');
const bodyParser =          require('body-parser');
const timeout =             require('connect-timeout');
const SN =                  require('sync-node');
const boxen =               require('boxen');
const DatabasesManager =    require('./model/databasesManager.js');
const logjs =               require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const DATABASE_FOLDER = "data/";
const expectedDBNEnvVar = "DATABASES";
const expectedTPORTEnvVar = "TURBINE_PORT";
const expectedDebugKeyEnvVar = "DEBUG";

let databaseNames = null;
let debug = false;
let turbine_port = false;

process.argv.forEach(function (val, index, array) {
    if (val.indexOf(expectedDBNEnvVar) > -1) {
        databaseNames = val.replaceAll(expectedDBNEnvVar + "=", "").split(",");
    }
    if (val.indexOf(expectedDebugKeyEnvVar) > -1) {
        debug = val.replaceAll(expectedDebugKeyEnvVar + "=", "") === "true";
    }
    if (val.indexOf(expectedTPORTEnvVar) > -1) {
        turbine_port = val.replaceAll(expectedTPORTEnvVar + "=", "");
    }
});

let config = {
    databases: databaseNames
};

const MAX_REQUEST = 15;

/**
 * check if given databases has own folder and collections, if not they are created.
 * also loads databases as associative arrays
 * @type {DatabasesManager}
 */
let databaseManager = new DatabasesManager(config);

// console.log(boxen('turbine', {padding: 2, borderColor: "cyan", borderStyle: 'round'}));
// console.log("starting ..");
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
                let interf = req.body.mask || {};
                let object = databaseManager.getObject(req.body.database, req.body.path, "", interf);
                if (typeof object === "string") {
                    console.error(object);
                    res.status(406).send(object);
                } else {
                    res.json(object)
                }
            } else if (req.body.method === "post" && req.body.value !== undefined) {
                databaseManager.saveObject(req.body.database, req.body.path, req.body.value === null ? null : req.body.value).then(function (result) {
                    if (typeof result === "string") {
                        console.error(result);
                        res.status(406).send(result);
                    } else {
                        res.json({})
                    }
                });
            } else if (req.body.method === "query" && req.body.query !== undefined) {
                let interf = req.body.mask || {};
                let object = databaseManager.getObjectFromQuery(req.body.database, req.body.path, req.body.query, interf);
                if (typeof object === "string") {
                    console.error(object);
                    res.status(406).send(object);
                } else {
                    res.json(object)
                }
            } else {
                res.status(406).send("💥");
            }
        } else {
            res.status(406).send("💥");
        }
    });
});

app.use('/', router);
app.listen(turbine_port, function () {
    logger.info("Turbine database started (" + turbine_port + ")");
});
