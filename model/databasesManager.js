const fs = require('fs');
const path = require('path');
const setIn = require('set-in');
const unset = require('unset');
const JsonDB = require('node-json-db');
const log = require('single-line-log').stdout;
const RecursiveIterator = require('recursive-iterator');

const SLASH = "/";

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function DatabasesManager(configuration) {

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
            fs.writeFile(folder + '/col_0.json', "{}", (err) => {
                if (err) throw err;
            });
        } else {
            for (let item in items) {
                console.log(items[item]);
            }
        }
    };

    this.isEmpty = async function (folder) {
        let items = await fs.readdirSync(folder);
        return items.length === 0;
    };

    this.loadCollectionsOn = async function (database) {
        let folder = "data/" + database;
        let items = await fs.readdirSync(folder);
        if (items.length === 0) {
            throw new Error("no collections found in " + folder);
        } else {
            if (this.databases[database] === undefined) {
                this.databases[database] = {}
            }
            for (let i in items) {
                let item = this.getCollectionNumber(items[i]);
                if (this.databases[database][item] === undefined) {
                    this.databases[database][item] = {}
                }
                let dataPath = folder + SLASH + this.getCollectionName(items[i]);
                this.databases[database][item].database = new JsonDB(dataPath, true, true);
                this.databases[database][item].data = this.databases[database][item].database.getData(SLASH);
                if (this.databases[database][item].values === undefined) {
                    this.databases[database][item].values = {};
                }
                console.log("Indexing " + database);
                this.reindexValues(this.databases[database][item]);
            }
        }
    };

    this.getObject = function (database, value) {
        this.processed++;
        if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let branchs = value.split(SLASH);
            let collections = Object.keys(this.databases[database]);
            let objects = {
                parts: []
            };
            for (let c in collections) {
                let object = this.databases[database][collections[c]].data;
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
                objects.parts.push(object);
            }
            return this.mergeObjects(objects)
        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            let collections = Object.keys(this.databases[database]);
            let objects = {
                parts: []
            };
            for (let c in collections) {
                objects.parts.push(this.databases[database][collections[c]].data);
            }
            return this.mergeObjects(objects);
        } else {
            return null
        }
    };

    this.mergeObjects = function(objects) {
        let object = {};
        if (objects.parts !== undefined && objects.parts.length > 1) {
            for (let p in objects.parts) {
                if (typeof objects.parts[p] === "object") {
                    let keys = Object.keys(objects.parts[p]);
                    for (let k in keys) {
                        if (object[keys[k]] === undefined) {
                            object[keys[k]] = objects.parts[p][keys[k]]
                        }
                    }
                }
            }
            return object;
        } else if (objects.parts !== undefined && objects.parts.length === 1) {
            return objects.parts[0];
        } else {
            return null;
        }
    };

    this.reindexValues = function (params) {
        for (let {parent, node, key, path, deep} of new RecursiveIterator(params.data)) {
            if (typeof node !== "object") {
                if (params.values[node] === undefined) {
                    params.values[node] = [];
                }
                this.indexed++;
                log('i: ' + this.indexed);
                params.values[node].push("/" + path.join("/"));
            }
        }
        console.log("\n🎉")
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
            let collections = Object.keys(this.databases[database]);
            for (let c in collections) {
                let object = this.databases[database][collections[c]].data;
                for (let b in branchs) {
                    let branch = branchs[b];
                    if (branch.length === 0) {
                        continue;
                    }
                    if (branch === "*") {
                        let keys = Object.keys(query);
                        for (let k in keys) {
                            let key = keys[k];
                            if (this.databases[database][collections[c]].values[query[key]] !== undefined) {
                                for (let p in this.databases[database][collections[c]].values[query[key]]) {
                                    if (this.databases[database][collections[c]].values[query[key]][p].indexOf(value.replace(/\*/g, '')) > -1) {
                                        let valid = this.databases[database][collections[c]].values[query[key]][p].replaceAll("/" + key, "");
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
            }
            let res = [];
            for (let obj in result) {
                if (action.validateObject(result[obj], query)) {
                    if (!action.containsObject(res, result[obj])) {
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
    this.saveObject = function (database, value, object) {
        this.processed++;
        let store = null;
        if (typeof object === "string") {
            store = JSON.parse(object)
        } else {
            store = object;
        }
        // TODO update this
        action.updateValDB(database, value, store);
        if (store == null || JSON.stringify(store) === "{}") {
            let collections = Object.keys(this.databases[database]);
            for (let c in collections) {
                this.databases[database][collections[c]].data = unset(this.databases[database][collections[c]].data, [value])
            }
        } else if (value.startsWith(SLASH) && value.length > SLASH.length) {
            let branchsVal = value.split(SLASH);
            let branchs = [];
            for (let b in branchsVal) {
                if (branchsVal[b].length > 0) {
                    branchs.push(branchsVal[b]);
                }
            }
            // TODO check if exist and if not, insert in best collection
            if (database !== null && database === "paths") {
                paths = setIn(paths, branchs, store);
            } else {
                data = setIn(data, branchs, store);
            }

        } else if (value.startsWith(SLASH) && value.length === SLASH.length) {
            let collections = Object.keys(this.databases[database]);
            for (let c in collections) {
                // TODO insert on existing or insert in best collection
                this.databases[database][collections[c]].data = store;
            }
        }
    };

    this.getCollectionNumber = function (item) {
        return this.getCollectionName(item.replaceAll("col_", ""));
    };
    this.getCollectionName = function (item) {
        return item.replaceAll(".json", "");
    };

    // init databases
    this.loadDatabases().then(function () {
        console.log("manager ready")
    })
}

module.exports = DatabasesManager;
