const RecursiveIterator = require('recursive-iterator');

function Utils() {

    /**
     *
     * @param collection
     * @returns String
     */
    this.getCollectionNumber = function (collection) {
        return this.getCollectionName(collection.replaceAll("col_", ""));
    };

    /**
     *
     * @param collection
     * @returns String
     */
    this.getCollectionName = function (collection) {
        return collection.replaceAll(".json", "");
    };

    /**
     *  {
     *      parts: [...]
     *  }
     * @param objects
     * @returns {*}
     */
    this.mergeObjects = function(objects, interf) {
        let inter = Object.keys(interf).length > 0 ? interf : false;
        let object = {};
        if (objects.parts !== undefined && objects.parts.length > 1) {
            for (let p in objects.parts) {
                if (typeof objects.parts[p] === "object") {
                    let keys = Object.keys(objects.parts[p]);
                    for (let k in keys) {
                        console.log("key: " + keys[k])
                        if (object[keys[k]] === undefined && (!inter || (inter && (typeof inter[keys[k]] === typeof objects.parts[p][keys[k]] || typeof inter["_"] === typeof objects.parts[p][keys[k]])))) {
                            object[keys[k]] = objects.parts[p][keys[k]]
                        } else if (typeof object[keys[k]] === "object" && typeof objects.parts[p][keys[k]] === "object" && (!inter || (inter && (typeof inter[keys[k]] === typeof objects.parts[p][keys[k]] || typeof inter["_"] === typeof objects.parts[p][keys[k]])))) {
                            object[keys[k]] = this.mergeObjects({parts:[object[keys[k]],objects.parts[p][keys[k]]]}, inter[keys[k]])
                        } else {
                            console.error("conflicts with type: " + (typeof objects.parts[p][keys[k]]));
                            console.error("inter[keys[k]]: " + inter[keys[k]]);
                        }
                    }
                }
            }
            return object;
        } else if (objects.parts !== undefined && objects.parts.length === 1) {
            let object = {};
            let keys = Object.keys(objects.parts[0]);
            for (let k in keys) {
                console.log("key: " + keys[k])
                console.log("inter[keys[k]]" + inter[keys[k]])
                console.log("objects.parts[0][keys[k]]" + typeof objects.parts[0][keys[k]]);
                if (typeof object[keys[k]] === "object" && typeof objects.parts[0][keys[k]] === "object" && (!inter || (inter && (typeof inter[keys[k]] === typeof objects.parts[0][keys[k]] || typeof inter["_"] === typeof objects.parts[p][keys[k]]))))  {
                    object[keys[k]] = this.mergeObjects({parts:[object[keys[k]],objects.parts[0][keys[k]]]}, inter[keys[k]])
                } else if (object[keys[k]] === undefined && (!inter || (inter && (typeof inter[keys[k]] === typeof objects.parts[0][keys[k]] || typeof inter["_"] === typeof objects.parts[0][keys[k]]))))  {
                    object[keys[k]] = objects.parts[0][keys[k]]
                } else  {
                    console.error("conflicts with type: " + (typeof objects.parts[0][keys[k]]));
                }
            }
            return object;
        } else {
            return null;
        }
    };

    this.sizeOf = function(obj){
        let size = 0;
        for (let {parent, node, key, path, deep} of new RecursiveIterator(obj)) {
            size++
        }
        return size;
    };

    this.containsObject = function (array, toCheck) {
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
    };

    this.sameArray = function(arr1, arr2) {
        return !(arr1.length != arr2.length || arr1.some((v) => arr2.indexOf(v) < 0));
    };

    /**
     * Checks if object has all properties of query
     * @param object
     * @param query
     * @returns {boolean}
     */
    this.validateObject = function (object, query) {
        if (object === undefined) {
            return false
        }
        let fields = Object.keys(query);
        let valid = true;
        for (let f in fields) {
            if (object.hasOwnProperty(fields[f]) && typeof object[fields[f]] === "object") {
                if ('[object Array]' === Object.prototype.toString.apply(object[fields[f]])) {
                    if (!this.sameArray(object[fields[f]], query[fields[f]])) {
                        valid = false;
                        break;
                    }
                } else {
                    if (object[fields[f]] !== query[fields[f]]) {
                        valid = false;
                        break;
                    }
                }
            } else if (object.hasOwnProperty(fields[f]) && typeof object[fields[f]] === "string") {
                if (object[fields[f]].toLowerCase() !== query[fields[f]].toLowerCase()) {
                    valid = false;
                    break;
                }
            } else if (object.hasOwnProperty(fields[f]) && typeof object[fields[f]] === "number") {
                if (object[fields[f]] != query[fields[f]]) {
                    valid = false;
                    break;
                }
            } else {
                valid = false;
                break;
            }
        }
        return valid
    };

}

module.exports = Utils;