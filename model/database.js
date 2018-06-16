const RecursiveIterator = require('recursive-iterator');
const log = require('single-line-log').stdout;
const JsonDB = require('node-json-db');
const SLASH = "/";
const MAX_SIZE = 100000;

function Database(params) {

    this.name = params.name;
    this.utils = params.utils || new Utils();
    this.database = {};
    this.indexed = 0;

    this.collectionKeys = function() {
        return Object.keys(this.database);
    };

    this.collection = function(collection) {
        return this.database[collection];
    };

    this.addCollection = function(collectionName) {
        let collectionNumber = this.utils.getCollectionNumber(collectionName);
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

    this.setData = function(collection, data) {
        this.database[collection].data = data;
    };

    this.getData = function(collection) {
        return this.database[collection].data;
    };

    this.enoughtSpace = function(collection) {
        return JSON.stringify(this.database[collection].data).length < MAX_SIZE;
    };

    this.hasObject = function(collection, path) {
        let branchs = path.split(SLASH);
        let object = this.collection(collection).data;
        let found = false;
        for (let b in branchs) {
            if (branchs[b].length > 0 && object[branchs[b]] !== undefined) {
                object = object[branchs[b]];
                if (b == (branchs.length - 1)) {
                    found = true;
                }
            }
        }

        return found;
    };

    this.reindexValues = function (params) {
        let nodes = 0;
        for (let {parent, node, key, path, deep} of new RecursiveIterator(params.data)) {
            if (typeof node !== "object") {
                if (typeof node === "string") {
                    node = node.toLowerCase();
                }
                if (params.values[node] === undefined) {
                    params.values[node] = [];
                    nodes++;
                }
                this.indexed++;
                log('i: ' + this.indexed + " lenght: " + nodes);
                params.values[node].push("/" + path.join("/"));
            } else if ('[object Array]' === Object.prototype.toString.apply(node)) {
                for (let i = 0; i < node.length; i++) {
                    if (params.values[node[i]] === undefined) {
                        params.values[node[i]] = [];
                        nodes++;
                    }
                    this.indexed++;
                    log('i: ' + this.indexed + " lenght: " + nodes);
                    params.values[node[i]].push("/" + path.join("/") + "/" + i + "-list");
                }
            }
        }
        console.log((this.indexed > 0 ? "\n" : "") + "👍")
    };

    this.getCollectionToInsert = function(path) {
        let collections = this.collectionKeys();
        let suggested = null;
        let suggestedForSize = null;
        let length = null;
        for (let c in collections) {
            if (this.hasObject(collections[c], path)) {
                suggested = collections[c];
                break;
            } else {
                let size = Object.keys(this.database[collections[c]].values).length;
                if ((length === null || length > size) && size < MAX_SIZE) {
                    length = size;
                    suggestedForSize = collections[c];
                }
            }
        }
        if (suggested !== null) {
            return suggested;
        } else {
            return suggestedForSize;
        }
    };

    /**
     * Saves every collection's content in its JSON file
     */
    this.save = function() {
        try {
            let collections = this.collectionKeys();
            for (let c in collections) {
                this.database[collections[c]].jsondb.push(SLASH, this.database[collections[c]].data)
            }
        } catch (e) {
            console.error("error on data backup " + this.name + ": " + e)
        }
    }
}

module.exports = Database;
