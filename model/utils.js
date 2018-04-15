
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
    this.mergeObjects = function(objects) {
        let object = {};
        if (objects.parts !== undefined && objects.parts.length > 1) {
            for (let p in objects.parts) {
                if (typeof objects.parts[p] === "object") {
                    let keys = Object.keys(objects.parts[p]);
                    for (let k in keys) {
                        if (object[keys[k]] === undefined) {
                            object[keys[k]] = objects.parts[p][keys[k]]
                        } else if (typeof object[keys[k]] === "object" && typeof objects.parts[p][keys[k]] === "object") {
                            object[keys[k]] = this.mergeObjects({parts:[object[keys[k]],objects.parts[p][keys[k]]]})
                        } else {
                            console.error("conflicts with type: " + (typeof objects.parts[p][keys[k]]));
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

    this.sizeOf = function(obj){
        let prim = {obj: obj, size: 0};
        this.sizeOfPrim(prim);
        return prim.size;
    };

    this.sizeOfPrim = function(param){
        let clone, i;

        if (typeof param.obj !== 'object' || !param.obj)
            return param.obj;

        if ('[object Array]' === Object.prototype.toString.apply(param.obj)) {
            clone = [];
            let len = param.obj.length;
            param.size += len;
            for (i = 0; i < len; i++)
                clone[i] = this.sizeOfPrim({obj: param.obj[i], size: param.size});
            return clone;
        }

        clone = {};
        for (i in param.obj)
            if (param.obj.hasOwnProperty(i)) {
                param.size += 1;
                clone[i] = this.sizeOfPrim({obj: param.obj[i], size: param.size});
            }
        return clone;
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

    this.validateObject = function (object, query) {
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
    };

}

module.exports = Utils;