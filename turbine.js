const JsonDB = require('node-json-db');
const express = require('express');
const fs = require('fs');
const path = require('path');
const Interval = require('Interval');
const setIn = require('set-in');
const unset = require('unset');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const SN = require('sync-node');
const boxen = require('boxen');
const log = require('single-line-log').stdout;
const RecursiveIterator = require('recursive-iterator');
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
let initOn = new Date().getTime();
const SLASH = "/";
const router = express.Router();
const queue = SN.createQueue();

const dbPath = new JsonDB("paths", true, true);
const dbData = new JsonDB(db_name, true, true);

/**
 * instanced objects: data - paths
 */
let paths = null;
let data = null;
if (mode !== "simple") {
    try {
        // paths = dbPath.getData(SLASH);
    } catch (e) {
        paths = {};
        fs.writeFile('paths.json', "{}", (err) => {
            if (err) throw err;
            console.log("Database paths created");
        });
    }
}
try {
    //data = dbData.getData(SLASH);
} catch (e) {
    data = {};
    fs.writeFile(db_name + '.json', "{}", (err) => {
        if (err) throw err;
        console.log("Database " + db_name + " created");
    });
}

let dataVal = {};

let indexed = 0;
let processed = 0;

let action = {

    /**
     * Returns an object from a instance for the given path (value)
     * @param database
     * @param value
     * @returns {*}
     */
    getObject: function (database, value) {
        processed++;
        if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let branchs = value.split(SLASH);
            let object = null;
            if (database !== null && database === "paths") {
                object = paths;
            } else {
                object = data;
            }
            for (let b in branchs) {
                let branch = branchs[b];
                if (branch.length === 0) {
                    continue;
                }
                if (object[branch] === undefined || object[branch] === null) {
                    object[branch] = {};
                }
                object = object[branch];
            }
            return object
        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            return data;
        } else {
            return null
        }
    },

    reindexVal: function (object, path) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(object)) {
            if (typeof node !== "object") {
                if (dataVal[node] === undefined) {
                    dataVal[node] = [];
                }
                indexed++;
                log('Indexed ' + indexed);
                dataVal[node].push("/" + path.join("/"));
            }
        }
        console.log(".")
    },

    updateValDB: function (database, value, object) {
        // remove previous values
        let obj = action.getObject(database, value);
        action.recursiveUnset(obj, value);

        // store new values
        action.recursiveSet(object, value);
    },

    recursiveUnset: function (object, pa) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(object)) {
            if (typeof node !== "object") {
                if (dataVal[node] === undefined) {
                    dataVal[node] = [];
                }
                let toRemove = pa + "/" + path.join("/");
                if (dataVal[node].indexOf(toRemove) > -1) {
                    dataVal[node].slice(dataVal[node].indexOf(toRemove), 1)
                }
            }
        }
    },

    recursiveSet: function (object, pa) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(object)) {
            if (typeof node !== "object") {
                if (dataVal[node] === undefined) {
                    dataVal[node] = [];
                }
                let toAdd = pa + "/" + path.join("/");
                if (dataVal[node].indexOf(toAdd) === -1) {
                    dataVal[node].push(toAdd)
                }
            }
        }
    },

    /**
     * Returns an object from a instance for the given query and path (value)
     * @param database
     * @param value
     * @param query
     * @returns {*}
     */
    getObjectFromQuery: function (database, value, query) {
        processed++;
        if (query === undefined || query === null || JSON.stringify(query) === "{}" || value.indexOf("*") === -1) {
            return null
        } else if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let result = [];
            let branchs = value.split(SLASH);
            let object = data;
            for (let b in branchs) {
                let branch = branchs[b];
                if (branch.length === 0) {
                    continue;
                }
                if (branch === "*") {
                    let keys = Object.keys(query);
                    for (let k in keys) {
                        let key = keys[k];
                        if (dataVal[query[key]] !== undefined) {
                            for (let p in dataVal[query[key]]) {
                                if (dataVal[query[key]][p].indexOf(value.replace(/\*/g, '')) > -1) {
                                    let valid = dataVal[query[key]][p].replaceAll("/" + key, "");
                                    result.push(action.getObject(database, valid));
                                }
                            }
                        }
                    }
                    break;
                } else {
                    if (object[branch] === undefined || object[branch] === null) {
                        object[branch] = {};
                    }
                    object = object[branch];
                }
            }
            let res = [];
            for (let obj in result) {
                if (action.validateObject(result[obj], query)) {
                    if (!action.containsObject(res, result[obj])) {
                        res.push(result[obj])
                    }
                }
            }
            return res
        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            return data;
        } else {
            return null
        }
    },

    /**
     * Stores an object in the instance for the given type and path (value)
     * @param database
     * @param value ->  "/notifications/998476354
     * @param object -> object to store
     * @returns {*}
     */
    saveObject: function (database, value, object) {
        processed++;
        let store = null;
        if (typeof object === "string") {
            store = JSON.parse(object)
        } else {
            store = object;
        }
        action.updateValDB(database, value, store);
        if (store == null || JSON.stringify(store) === "{}") {
            if (database !== null && database === "paths") {
                paths = unset(paths, [value])
            } else {
                data = unset(data, [value])
            }
        } else if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let branchsVal = value.split(SLASH);
            let branchs = [];
            for (let b in branchsVal) {
                if (branchsVal[b].length > 0) {
                    branchs.push(branchsVal[b]);
                }
            }

            if (database !== null && database === "paths") {
                paths = setIn(paths, branchs, store);
            } else {
                data = setIn(data, branchs, store);
            }

        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            if (database !== null && database === "paths") {
                paths = store;
            } else {
                data = store;
            }
        }
    },

    validateObject: function (object, query) {
        if (object === undefined) {
            return false
        }
        let fields = Object.keys(query);
        let valid = true;
        for (let f in fields) {
            let field = fields[f];
            if (object[field] === undefined || object[field] !== query[field]) {
                valid = false;
                break;
            }
        }
        return valid
    },

    containsObject: function (array, toCheck) {
        if (array === null || array.length === 0) {
            return false
        } else if (toCheck === undefined) {
            return false
        }
        let isContained = true;
        for (let index in array) {
            let item = array[index];
            let fields = Object.keys(toCheck);
            for (let f in fields) {
                let field = fields[f];
                if (item[field] === undefined || item[field] !== toCheck[field]) {
                    isContained = false;
                    break;
                }
            }
        }
        return isContained
    }
};


action.reindexVal(data, "");
if (mode !== "simple") {
    action.reindexVal(paths, "");
    console.log("running non-simple mode")
}

/**
 * backup every 5 seconds
 */
let time = 5;
Interval.run(function () {
    queue.pushJob(function () {
        if (processed > 0) {
            log((processed / time) + " op/sec");
            processed = 0;
        } else {
            log("0 op/sec");
        }
        try {
            dbData.push(SLASH, data);
        } catch (e) {
            logger.error("error on data backup: " + e)
        }
        if (mode !== "simple") {
            try {
                dbPath.push(SLASH, paths);
            } catch (e) {
                logger.error("error on paths backup: " + e)
            }
        }
    })
}, time * 1000);


const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(timeout('120s'));

router.post('/', function (req, res) {
    queue.pushJob(function () {
        let msg = req.body;
        if (msg.method !== undefined && msg.path !== undefined && mode !== null && mode.length > 0) {
            if (msg.database === undefined && mode === "simple") {
                msg.database = null;
            } else if (msg.database === undefined && mode !== "simple") {
                console.log("database param not found");
                res.status(500).send("database param not found");
                return
            }

            if (msg.method === "get") {
                let object = action.getObject(msg.database, msg.path);
                res.json(object)
            } else if (msg.method === "post" && msg.value !== undefined) {
                action.saveObject(msg.database, msg.path, msg.value === null ? null : msg.value);
                res.json({})
            } else if (msg.method === "query" && msg.query !== undefined) {
                let object = action.getObjectFromQuery(msg.database, msg.path, msg.query);
                res.json(object)
            } else {
                res.json({})
            }
        } else {
            res.json({})
        }
    });
});

app.use('/', router);
app.listen(turbine_port, function () {
    console.log("started on " + turbine_port + " (" + ((new Date().getTime() - initOn) / 1000) + " secs)");
});
