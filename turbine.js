const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const SN = require('sync-node');
const boxen = require('boxen');
const DatabasesManager = require('./model/databasesManager.js');
const AccessManager = require('./model/access_manager.js');
const ApplicationProfile = require('./model/app_profile.js');
const logjs = require('logjsx');
const logger = new logjs();
logger.init({
  level: "DEBUG"
});

String.prototype.replaceAll = function (search, replacement) {
  let target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

const expectedDBNEnvVar = "DATABASES";
const expectedTPORTEnvVar = "TURBINE_PORT";
const expectedDebugKeyEnvVar = "DEBUG";
const expectedProtectedKeyEnvVar = "PROTECTED";

let databaseNames = null;
let debug = false;
let turbine_port = false;
let protect = true;

process.argv.forEach(function (val, index, array) {
  if (val.indexOf(expectedDBNEnvVar) > -1) {
    databaseNames = val.replaceAll(expectedDBNEnvVar + "=", "").split(",");
  }
  if (val.indexOf(expectedDebugKeyEnvVar) > -1) {
    debug = val.replaceAll(expectedDebugKeyEnvVar + "=", "").toLocaleLowerCase() === "true";
  }
  if (val.indexOf(expectedTPORTEnvVar) > -1) {
    turbine_port = val.replaceAll(expectedTPORTEnvVar + "=", "");
  }
  if (val.indexOf(expectedProtectedKeyEnvVar) > -1) {
    protect = val.replaceAll(expectedProtectedKeyEnvVar + "=", "").toLocaleLowerCase()  === "true";
  }
});

let config = {
  databases: databaseNames,
  access: new AccessManager(),
  app_profile: new ApplicationProfile()
};

// access manager
config.access.init();

// application profile
config.app_profile.init();

/**
 * check if given databases has own folder and collections, if not they are created.
 * also loads databases as associative arrays
 * @type {DatabasesManager}
 */
let databaseManager = new DatabasesManager(config);

if (config.app_profile.getConfig() !== null && config.app_profile.getConfig().name !== undefined) {
  console.log(boxen(config.app_profile.getConfig().name, {padding: 2, borderColor: "cyan", borderStyle: 'round'}));
} else {
  console.log(boxen('turbine', {padding: 2, borderColor: "cyan", borderStyle: 'round'}));
}
const router = express.Router();
const queue = SN.createQueue();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(timeout('120s'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Allow-Origin");
  next();
});
router.post('/', function (req, res) {
  if (config.access.validRequest(req.body) || !protect) {
    queue.pushJob(function () {
      if (req.body.method !== undefined && req.body.path !== undefined && req.body.database !== undefined) {
        if (req.body.method === "post" && req.body.value !== undefined) {
          databaseManager.saveObject(req.body.database, req.body.path, req.body.value === null ? null : req.body.value).then(function (result) {
            if (typeof result === "string") {
              console.error(result);
              res.status(406).send(result);
            } else {
              res.json({})
            }
          });
        } else {
          res.status(406).send("💥");
        }
      } else if (req.body.method === "add_member") {
        let app_profile = config.app_profile.getConfig();
        if (app_profile === null) {
          res.status(204).send("{}");
        } else {
          res.json(app_profile)
        }
      } else {
        res.status(406).send("💥");
      }
    });
  } else {
    res.status(403).send("🖕");
  }
});
router.get('/', function (req, res) {
  if (config.access.validRequest(req.query) || !protect) {
    queue.pushJob(function () {
      if (req.query.method !== undefined && req.query.path !== undefined && req.query.database !== undefined) {
        if (req.query.method === "get") {
          let interf = req.query.mask || {};
          let object = databaseManager.getObject(req.query.database, req.query.path, "", interf);
          if (typeof object === "string") {
            console.error(object);
            res.status(406).send(object);
          } else {
            res.json(object)
          }
        } else if (req.query.method === "query" && req.query.query !== undefined) {
          let interf = req.query.mask || {};
          let object = databaseManager.getObjectFromQuery(req.query.database, req.query.path, req.query.query, interf);
          if (typeof object === "string") {
            console.error(object);
            res.status(406).send(object);
          } else {
            res.json(object)
          }
        } else {
          res.status(406).send("💥");
        }
      } else if (req.query.method === "get_basic_info") {
        let app_profile = config.app_profile.getConfig();
        if (app_profile === null) {
          app_profile = {};
        }
        if (app_profile.name === undefined) {
          app_profile.name = "Turbine"
        }
        if (app_profile.toolbar_color === undefined) {
          app_profile.toolbar_color = "#ffffff"
        }
        app_profile.mode = config.access.isFirstRun() ? "first_run" : "manager";
        res.json(app_profile)
      } else {
        res.status(406).send("💥");
      }
    });
  } else {
    res.status(403).send("🖕");
  }
});

app.use('/', router);
app.listen(turbine_port, function () {
  logger.info("Turbine database started (" + turbine_port + ")");
});
