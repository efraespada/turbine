const RecursiveIterator = require('recursive-iterator');
const Utils = require('./utils.js');
const JsonDB = require('node-json-db');
const SLASH = "/";

const utils = new Utils();

function Database(name) {

    this.name = name;
    this.database = {};
    this.indexed = 0;

    this.collectionKeys = function() {
        return Object.keys(this.database);
    };

    this.collection = function(collection) {
        return this.database[collection];
    };

    this.addCollection = function(collectionName) {
        let collectionNumber = utils.getCollectionNumber(collectionName);
        if (this.database[collectionNumber] === undefined) {
            this.database[collectionNumber] = {};
            this.database[collectionNumber].jsondb = new JsonDB("data/" + this.name + SLASH + collectionName, true, true);
            this.database[collectionNumber].data = this.database[collectionNumber].jsondb.getData(SLASH);
            this.database[collectionNumber].values = {};
            console.log("Indexing " + this.name);
            this.reindexValues(this.database[collectionNumber]);
        } else {
            console.error("collection already added")
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

    this.getCollectionToInsert = function() {

    }
}

module.exports = Database;