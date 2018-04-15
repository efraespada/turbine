const fs = require('fs');
const path = require('path');
const setIn = require('set-in');
const unset = require('unset');
const JsonDB = require('node-json-db');
const log = require('single-line-log').stdout;
const Utils = require('./utils.js');
const Database = require('./database.js');
const Collections = require('./collection.js');
const RecursiveIterator = require('recursive-iterator');
const Interval = require('Interval');
const SN = require('sync-node');
const queue = SN.createQueue();

const utils = new Utils();
const SLASH = "/";

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function DatabasesManager(configuration) {

    let interval = 5; // secs
    let _this = this;
    this.databases = {};
    this.indexed = 0;
    this.processed = 0;
    this.configuration = configuration;

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

    /**
     * check if database folder exists
     */
    this.loadSingleDatabase = async function (database) {
        let folder = "data/";
        await this.createDir(folder + database);
        if (await this.isEmpty(folder + database)) {
            await this.createCollectionOn(folder + database)
        }
        await this.loadCollectionsOn(database);
    };

    this.loadDatabases = async function () {
        if (this.configuration.databases === undefined || this.configuration.databases.length === 0) {
            throw Error("there is no database defined on configuration")
        } else {
            for (let db in this.configuration.databases) {
                await this.loadSingleDatabase(this.configuration.databases[db])
            }
        }
    };

    this.createCollectionOn = async function (folder) {
        let items = await fs.readdirSync(folder);
        if (items.length === 0) {
            await fs.writeFileSync(folder + '/col_0.json', "{}");
            return "0";
        } else {
            await fs.writeFileSync(folder + '/col_' + items.length + '.json', "{}");
            return items.length + "";
        }
    };

    this.isEmpty = async function (folder) {
        let items = await fs.readdirSync(folder);
        return items.length === 0;
    };

    this.loadCollectionsOn = async function (database) {
        if (this.databases[database] === undefined) {
            let folder = "data/" + database;
            let items = await fs.readdirSync(folder);
            if (items.length === 0) {
                throw new Error("no collections found in " + folder);
            } else {
                this.databases[database] = new Database({name: database, utils: utils});
                for (let i in items) {
                    this.databases[database].addCollection(utils.getCollectionName(items[i]));
                }
            }
        } else {
            console.error("database already loaded")
        }
    };

    this.getObject = function (database, value, collection) {
        this.processed++;
        if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let branchs = value.split(SLASH);
            let collections = this.databases[database].collectionKeys();
            let parts = [];
            console.log("collection: " + collection);
            if (collection === undefined || collection.length === 0) {
                for (let c in collections) {
                    let object = this.databases[database].collection(collections[c]).data;
                    for (let b in branchs) {
                        if (branchs[b].length > 0 && object[branchs[b]] !== undefined) {
                            object = object[branchs[b]];
                        }
                    }
                    parts.push(object);
                }
            } else {
                let object = this.databases[database].collection(collection).data;
                parts.push(object);
            }
            return parts.length === 0 ? {} : utils.mergeObjects({parts: parts});
        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            let collections = this.databases[database].collectionKeys();
            let parts = [];
            if (collection === undefined) {
                for (let c in collections) {
                    parts.push(this.databases[database].collection(collections[c]).data);
                }
            } else {
                parts.push(this.databases[database].collection(collection).data);
            }
            return parts.length === 0 ? {} : utils.mergeObjects({parts: parts});
        } else {
            return null
        }
    };

    /**
     * Returns an object from a instance for the given query and path (value)
     * @param database
     * @param value
     * @param query
     * @returns {*}
     */
    this.getObjectFromQuery = function (database, value, query) {
        this.processed++;
        if (query === undefined || query === null || JSON.stringify(query) === "{}" || value.indexOf("*") === -1) {
            return null
        } else if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let result = [];
            let branchs = value.split(SLASH);
            let collections = this.databases[database].collectionKeys();
            for (let c in collections) {
                let object = this.databases[database].collection(collections[c]).data;
                for (let b in branchs) {
                    if (branchs[b] === "*") {
                        let keys = Object.keys(query);
                        for (let k in keys) {
                            let key = keys[k];
                            if (this.databases[database].collection(collections[c]).values[query[key]] !== undefined) {
                                for (let p in this.databases[database].collection(collections[c]).values[query[key]]) {
                                    if (this.databases[database].collection(collections[c]).values[query[key]][p].indexOf(value.replace(/\*/g, '')) > -1) {
                                        let valid = this.databases[database].collection(collections[c]).values[query[key]][p].replaceAll("/" + key, "");
                                        result.push(this.getObject(database, valid));
                                    }
                                }
                            }
                        }
                        break;
                    } else if (branchs[b].length > 0 && object[branchs[b]] !== undefined) {
                        object = object[branchs[b]];
                    }
                }
            }
            let res = [];
            for (let obj in result) {
                if (utils.validateObject(result[obj], query)) {
                    if (!utils.containsObject(res, result[obj])) {
                        res.push(result[obj])
                    }
                }
            }
            return res;
        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            return this.getObject(database, value);
        } else {
            return null
        }
    };

    /**
     * Stores an object in the instance for the given type and path (value)
     * @param database
     * @param value ->  "/notifications/998476354
     * @param object -> object to store
     * @returns {*}
     */
    this.saveObject = async function (database, value, object) {
        this.processed++;
        let store = null;
        if (typeof object === "string") {
            store = JSON.parse(object)
        } else {
            store = object;
        }
        // TODO update this
        if (store == null || store === {}) {
            let collections = this.databases[database].collectionKeys();
            for (let c in collections) {
                this.updateValueMap(database, collections[c], value, store);
                this.databases[database].collection(collections[c]).data = unset(this.databases[database].collection(collections[c]).data, [value])
            }
        } else if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let collection = this.databases[database].getCollectionToInsert(value);
            console.log("collection to insert: " + collection);
            if (collection === null) {
                collection = await this.createCollectionOn("data/" + database)
            }
            this.updateValueMap(database, collection, value, store);
            let branchsVal = value.split(SLASH);
            let branchs = [];
            for (let b in branchsVal) {
                if (branchsVal[b].length > 0) {
                    branchs.push(branchsVal[b]);
                }
            }
            this.databases[database].setData(collection, setIn(this.databases[database].getData(collection), branchs, store));
        } else if (value === SLASH) {
            // TODO reset database
            console.error("in progress: " + value)
        }
    };

    /**
     * Updates value map
     * @param database
     * @param collection
     * @param path
     * @param object
     */
    this.updateValueMap = function (database, collection, path, object) {
        if (collection === undefined || collection.length === 0) {
            throw new Error("Collection not found updating value map");
        }

        // remove previous values
        let obj = this.getObject(database, path, collection);
        this.recursiveUnset(database, collection, path, obj);

        // store new values
        this.recursiveSet(database, collection, path, object);
    };

    /**
     * Un-sets recursively values on value map
     * @param database
     * @param collection
     * @param pa -> path
     * @param object
     */
    this.recursiveUnset = function (database, collection, pa, object) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(object)) {
            if (typeof node !== "object") {
                if (this.databases[database][collection].values[node] === undefined) {
                    this.databases[database][collection].values[node] = [];
                }
                let toRemove = pa + "/" + path.join("/");
                if (this.databases[database][collection].values[node].indexOf(toRemove) > -1) {
                    this.databases[database][collection].values[node].slice(this.databases[database][collection].values[node].indexOf(toRemove), 1)
                }
            }
        }
    };

    /**
     * Sets recursively values on value map
     * @param database
     * @param collection
     * @param pa -> path
     * @param object
     */
    this.recursiveSet = function (database, collection, pa, object) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(object)) {
            if (typeof node !== "object") {
                if (this.databases[database][collection].values[node] === undefined) {
                    this.databases[database][collection].values[node] = [];
                }
                let toAdd = pa + "/" + path.join("/");
                if (this.databases[database][collection].values[node].indexOf(toAdd) === -1) {
                    this.databases[database][collection].values[node].push(toAdd)
                }
            }
        }
    };

    this.save =  async function() {
        if (this.processed > 0) {
            log((this.processed / interval) + " op/sec");
            this.processed = 0;
        } else {
            log("0 op/sec");
        }

        let databases = Object.keys(this.databases);
        for (let d in databases) {
            this.databases[databases[d]].save();
        }
    };

    // init databases
    this.loadDatabases().then(function () {
        console.log("manager ready")
        Interval.run(function () {
            queue.pushJob(function () {
                _this.save().then(function() {

                })
            })
        }, interval * 1000);
    })


}

module.exports = DatabasesManager;
