const fs = require('fs');
const path = require('path');
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

    this.getCollectionNumber = function (item) {
        return item.replaceAll("col_", "").replaceAll(".json", "");
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
