const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const SN = require('sync-node');
const boxen = require('boxen');
const path = require('path');
const numCPUs = require('os').cpus().length;
const computerName = require('computer-name');
const cluster = require('cluster');
const EventBus = require('cluster-eventbus');
const DatabasesManager = require('./component/databases_manager.js');
const AccessManager = require('./component/access_manager.js');
const ApplicationProfile = require('./component/app_profile.js');
const logjs = require('logjsx');

String.prototype.replaceAll = function (search, replacement) {
  let target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

// --------------- CONFIGURATION ---------------
const expectedConfigEnvVar = "CONFIG";
let env_config = null;
process.argv.forEach(function (val, index, array) {
  if (val.indexOf(expectedConfigEnvVar) > -1) {
    env_config = JSON.parse(val.replaceAll(expectedConfigEnvVar + "=", ""));
  } else {
    env_config = require(`./index`).DEFAULT_CONFIG;
  }
});

// --------------- MAIN ---------------
const logger = new logjs();
logger.init({ level: env_config.server.debug ? "DEBUG" : "INFO" });
const machineName = computerName();
const eventBus = new EventBus({
  core: env_config.server.cluster_core,
  debug: env_config.server.cluster_debug
}).cluster(cluster);

if (cluster.isMaster) {

  let workers = [];

  let spawn = function (i) {
    workers[i] = cluster.fork();
    workers[i].on('exit', function (code, signal) {
      logger.debug('respawning worker ' + i);
      spawn(i);
    });
  };

  for (let i = 0; i < numCPUs; i++) {
    spawn(i);
  }

  let config = {
    access: new AccessManager(env_config.server),
    app_profile: new ApplicationProfile(env_config.app)
  };

  // access manager
  config.access.init();

  /**
   * check if given databases has own folder and collections, if not they are created.
   * also loads databases as associative arrays
   * @type {DatabasesManager}
   */
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
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Allow-Origin");
    next();
  });

  router.post('/', function (req, res) {
    if (config.access.validRequest(req.body) || !env_config.server.protect) {
      queue.pushJob(function () {
        if (req.body.method !== undefined && req.body.path !== undefined && req.body.database !== undefined) {
          // TODO check where to POST data
          res.status(406).send("💥");
        } else if (req.body.method === "add_member" && req.body.user !== undefined) {
          config.access.addUser(req.body.user);
          res.json(req.body.user)
        } else if (req.body.method === "create_database" && req.body.name !== undefined) {
          // TODO check where to create the db
          res.status(406).send("💥");
        } else {
          res.status(406).send("💥");
        }
      });
    } else {
      res.status(403).send("🧙‍♂️");
    }
  });
  router.get('/', async (req, res) => {
    if (config.access.validRequest(req.query) || !env_config.server.protect) {
      if (req.query.method !== undefined && req.query.path !== undefined && req.query.database !== undefined) {
        let response = await eventBus.eventAll(req.query);
        if (response.error) {
          res.status(406).send(response.error_messages);
        } else {
          // TODO process multiple responses

          res.json(response.responses)
        }
      } else if (req.query.method === "get_basic_info") {
        let app_profile = {};
        app_profile.mode = config.access.isFirstRun() ? "first_run" : "manager";
        res.json(app_profile)
      } else if (req.query.method === "login") {
        if (config.access.verifyAccount(req.query)) {
          let api = config.access.getApiKey(req.query);
          if (api === null) {
            res.status(403).send("🧙‍♂️");
          } else {
            res.json(api)
          }
        } else {
          res.status(403).send("🧙‍♂️");
        }
      } else if (req.query.method === "get_databases_info") {
        let response = await eventBus.eventAll(req.query);
        if (response.error) {
          res.status(406).send(response.error_messages);
        } else {
          // TODO process multiple responses
          res.json(response.responses)
        }
      } else {
        res.status(406).send("💥");
      }
    } else {
      res.status(403).send("🧙‍♂️");
    }
  });

  app.use('/database', router);
  if (env_config.app.production) {
    app.use('/app/', express.static(path.join(__dirname, 'dist/turbine-app/')));
    app.all('/app/*', function (req, res, next) {
      if (req.originalUrl.indexOf(".css/") > -1 || req.originalUrl.indexOf(".js/") > -1 || req.originalUrl.indexOf(".json/") > -1) {
        res.sendFile('dist/turbine-app/' + req.originalUrl.substring(0, req.originalUrl.length - 1), {root: __dirname});
      } else {
        res.sendFile('dist/turbine-app/index.html', {root: __dirname});
      }
    });
  } else {
    logger.debug("Run ng serve --port " + (env_config.server.port + 1) + " --base-href=/app/ --deploy-url=/app/ ")
  }

  const server = require('http').createServer(app);
  const io = require('socket.io')(server);

  server.listen(env_config.server.port, function () {
    logger.info("Turbine database started (" + env_config.server.port + ")");
  });

  /*
  let status = io
    .of('/status')
    .on('connection', (socket) => {

      // on message event, returns streaming data
      socket.on('message', (data) => {


        if ((data.access !== undefined && config.access.validRequest(data.access)) || !env_config.server.protect) {

          let d = config.databaseManager.prepareStreamingData();
          console.log("message event: " + JSON.stringify(d));
          socket.emit('status', d);

        } else {
          logger.error("not authorized");
          socket.disconnect()
        }
      });

      socket.on('cluster_connection', (data) => {
        console.log("data: " + data);
      });

      // when the client connects, returns streaming data
      // socket.emit('status', config.databaseManager.prepareStreamingData());
      console.log("connection event")

    });
    */

  // config.databaseManager.ioStatus(status);

} else {
  let config = {
    databaseManager: new DatabasesManager(env_config.server, numCPUs, cluster.worker.id)
  };

  eventBus.prepareWorker(cluster, (params) => {
      if (params.method !== undefined && params.path !== undefined && params.database !== undefined) {
        if (params.method === "get") {
          let _interface = params.mask || {};
          let object = config.databaseManager.getObject(params.database, params.path, "", _interface);
          if (typeof object === "string") {
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              error: true,
              error_body: {
                code: 406,
                message: object
              }
            }
          } else {
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              response: object,
              error: false
            }
          }
        } else if (params.method === "query" && params.query !== undefined) {
          let _interface = params.mask || {};
          let object = config.databaseManager.getObjectFromQuery(params.database, params.path, params.query, _interface);
          if (typeof object === "string") {
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              error: true,
              error_body: {
                code: 406,
                message: object
              }
            }
          } else {
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              response: object,
              error: false
            }
          }

        } else if (params.method === "get_databases_info") {
          return {
            machine: machineName,
            worker_id: `worker_${cluster.worker.id}`,
            response: config.databaseManager.getDatabasesInfo(),
            error: false
          };
        } else if (params.method === "post" && params.value !== undefined) {
          config.databaseManager.saveObject(
            params.database,
            params.path,
            params.value === null || params.value === undefined ? null : params.value).then(function (result) {

              if (typeof result === "string") {
              return {
                machine: machineName,
                worker_id: `worker_${cluster.worker.id}`,
                error: true,
                error_body: {
                  code: 406,
                  message: result
                }
              }
            } else {
              let r;
              try {
                r = JSON.parse(params.value)
              } catch (e) {
                r = params.value;
              }
              return {
                machine: machineName,
                worker_id: `worker_${cluster.worker.id}`,
                response: r,
                error: false
              }
            }
          });
        } else if (params.method === "create_database" && params.name !== undefined) {
          if (config.databaseManager.createDatabase(params.name)) {
            let data = config.databaseManager.getDatabasesInfo();
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              response: data,
              error: false
            }
          } else {
            return {
              machine: machineName,
              worker_id: `worker_${cluster.worker.id}`,
              error: true,
              error_body: {
                code: 406,
                message: `database ${params.name} already exists`
              }
            }
          }
        }
      }

      // default response
      return {
        machine: machineName,
        worker_id: `worker_${cluster.worker.id}`,
        error: true,
        error_body: {
          code: 406,
          message: `missing params 💥`
        }
      }
    }
  );

}
