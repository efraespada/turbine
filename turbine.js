const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const SN = require('sync-node');
const boxen = require('boxen');
const path = require('path');
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const DatabasesManager = require('./model/databases_manager.js');
const AccessManager = require('./model/access_manager.js');
const ApplicationProfile = require('./model/app_profile.js');
const logjs = require('logjsx');
const logger = new logjs();

String.prototype.replaceAll = function (search, replacement) {
  let target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

const expectedConfigEnvVar = "CONFIG";

let env_config = null;

process.argv.forEach(function (val, index, array) {
  if (val.indexOf(expectedConfigEnvVar) > -1) {
    env_config = JSON.parse(val.replaceAll(expectedConfigEnvVar + "=", ""));
  }
});

logger.init({
  level: env_config.server.debug ? "DEBUG" : "INFO"
});

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
          if (req.body.method === "post" && req.body.value !== undefined) {
            /*
            config.databaseManager.saveObject(req.body.database, req.body.path, req.body.value === null ? null : req.body.value).then(function (result) {
              if (typeof result === "string") {
                console.error(result);
                res.status(406).send(result);
              } else {
                let r;
                try {
                  r = JSON.parse(req.body.value)
                } catch (e) {
                  r = req.body.value;
                }
                res.json(r)
              }
            });*/
          } else {
            res.status(406).send("💥");
          }
        } else if (req.body.method === "add_member" && req.body.user !== undefined) {
          /*
          config.access.addUser(req.body.user);
          res.json(req.body.user)
          */
        } else if (req.body.method === "create_database" && req.body.name !== undefined) {
          /*
          if (config.databaseManager.createDatabase(req.body.name)) {
            let data = config.databaseManager.getDatabasesInfo();
            res.json(data);
          } else {
            res.status(406).json({error: "database " + req.body.name + " already exists"});
          }
          */
        } else {
          res.status(406).send("💥");
        }
      });
    } else {
      res.status(403).send("🧙‍♂️");
    }
  });
  router.get('/', function (req, res) {
    if (config.access.validRequest(req.query) || !env_config.server.protect) {
      queue.pushJob(function () {
        if (req.query.method !== undefined && req.query.path !== undefined && req.query.database !== undefined) {
          if (req.query.method === "get") {
            let interf = req.query.mask || {};
            /*
            let object = config.databaseManager.getObject(req.query.database, req.query.path, "", interf);
            if (typeof object === "string") {
              console.error(object);
              res.status(406).send(object);
            } else {
              res.json(object)
            }
            */
          } else if (req.query.method === "query" && req.query.query !== undefined) {
            let interf = req.query.mask || {};
            /*
            let object = config.databaseManager.getObjectFromQuery(req.query.database, req.query.path, req.query.query, interf);
            if (typeof object === "string") {
              console.error(object);
              res.status(406).send(object);
            } else {
              res.json(object)
            }
            */
          } else {
            res.status(406).send("💥");
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
          // res.json(config.databaseManager.getDatabasesInfo());
        } else {
          res.status(406).send("💥");
        }
      });
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

  let status = io
    .of('/status')
    .on('connection', (socket) => {

      // on message event, returns streaming data
      socket.on('message', (data) => {


        if ((data.access !== undefined && config.access.validRequest(data.access)) || !env_config.server.protect) {
          /*
          let d = config.databaseManager.prepareStreamingData();
          console.log("message event: " + JSON.stringify(d));
          socket.emit('status', d);
          */
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
      /*
          status.emit('status', {
            everyone: 'in'
            , '/chat': 'will get'
          });*/
    });

  // clusters
  let sockect_cluster = io
    .of('/cluster')
    .on('connection', (socket) => {
      // connect cluster to room
      socket.on('join', (room) => {
        logger.debug("master => cluster " + room.cluster + " connected");
        socket.join(room.name);
      });
    });

  // config.databaseManager.ioStatus(status);

} else {
  let socket = require('socket.io-client')(env_config.server.ip + ':' + env_config.server.port + "/cluster");
  let config = {
    databaseManager: new DatabasesManager(env_config.server, numCPUs, cluster.worker.id)
  };
  socket.on('connect', () => {
    socket.emit('join', {
      name: "cluster",
      cluster: cluster.worker.id
    });
  });
  socket.on('event', (data) => {
    logger.debug("cluster " + cluster.worker.id + " => event received from master")
  });
  socket.on('disconnect', () => {
    logger.debug("cluster " + cluster.worker.id + " => disconnected of master")
  });
  config.databaseManager.socket_client(socket);
}
