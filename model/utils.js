const RecursiveIterator = require('recursive-iterator');
const setIn = require('set-in');


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
  this.mergeObjects = function (objects, interf = {}) {
    let inter = interf !== undefined && Object.keys(interf).length > 0 ? interf : false;
    let object = {};
    if (objects.parts !== undefined && objects.parts.length > 1) {
      for (let p in objects.parts) {
        if (typeof objects.parts[p] === "object") {
          let keys = Object.keys(objects.parts[p]);
          for (let k in keys) {
            if (object[keys[k]] === undefined) {
              object[keys[k]] = objects.parts[p][keys[k]]
            } else if (typeof object[keys[k]] === "object" && typeof objects.parts[p][keys[k]] === "object") {
              object[keys[k]] = this.mergeObjects({parts: [object[keys[k]], objects.parts[p][keys[k]]]})
            } else {
              console.error("conflicts with type: " + (typeof objects.parts[p][keys[k]]));
            }
          }
        }
      }

      if (typeof interf === "string" && interf !== "{}") {
        let obj = this.maskObject(object, JSON.parse(interf));
        return obj;
      }
      if (typeof interf === "object" && JSON.stringify(interf) !== "{}") {
        let obj = this.maskObject(object, interf);
        return obj;
      } else {
        return object;
      }
    } else if (objects.parts !== undefined && objects.parts.length === 1) {
      let object = {};
      let keys = Object.keys(objects.parts[0]);
      for (let k in keys) {
        if (typeof object[keys[k]] === "object" && typeof objects.parts[0][keys[k]] === "object") {
          object[keys[k]] = this.mergeObjects({parts: [object[keys[k]], objects.parts[0][keys[k]]]})
        } else if (object[keys[k]] === undefined) {
          object[keys[k]] = objects.parts[0][keys[k]]
        } else {
          console.error("conflicts with type: " + (typeof objects.parts[0][keys[k]]));
        }
      }

      if (typeof interf === "string" && interf !== "{}") {
        let obj = this.maskObject(object, JSON.parse(interf));
        return obj;
      }
      if (typeof interf === "object" && JSON.stringify(interf) !== "{}") {
        let obj = this.maskObject(object, interf);
        return obj;
      } else {
        return object;
      }
    } else {
      return null;
    }
  };

  this.maskObject = function (obj, interf) {
    let maskObj = this.getPathsOfQuery(obj);
    let maskInter = this.getPathsOfQuery(interf);
    let result = {};
    let maskObjKey = Object.keys(maskObj);
    let maskInterKey = Object.keys(maskInter);
    for (let i in maskObjKey) {
      let value = maskObjKey[i];
      for (let pathValueIndex in maskObj[value]) {
        let pathValue = maskObj[value][pathValueIndex];
        for (let u in maskInterKey) {
          let maskValue = maskInterKey[u];
          for (let maskValueIndex in maskInter[maskValue]) {
            let maskPath = maskInter[maskValue][maskValueIndex];
            // path contains *.
            if (maskPath.indexOf("*") > -1) {
              let pM = maskPath.split("/*");
              let valid = false;
              for (let iPM in pM) {
                let pToCheck = pM[iPM];
                let pathValues = pathValue.split("/");
                for (let value in pathValues) {
                  if ("/" + pathValues[value] == pToCheck) {
                    valid = true;
                  }
                }
              }
              if (valid) {
                let insert = pathValue.split("/");
                if (insert[0] === "") {
                  insert = insert.slice(1, insert.length);
                }
                setIn(result, insert, this.getTypeFromInterface(insert, interf, value));
              }
            } else if (maskValue === "{}" && pathValue.indexOf(maskPath) > -1) {
              let insert = pathValue.split("/");
              if (insert[0] === "") {
                insert = insert.slice(1, insert.length);
              }
              setIn(result, insert, this.getTypeFromInterface(insert, interf, value));
            } else {
              if (maskPath.indexOf(pathValue) > -1) {
                let insert = pathValue.split("/");
                if (insert[0] === "") {
                  insert = insert.slice(1, insert.length);
                }
                setIn(result, insert, this.getTypeFromInterface(insert, interf, value));
              }
            }
          }
        }
      }
    }
    return result;
  };

  this.getTypeFromInterface = function (path, mask, value) {
    let a = path.slice(0);
    let keys = Object.keys(mask);
    for (let i in keys) {
      let key = keys[i];
      if (key === "*") {
          if (typeof mask[key] === "object") {
            return this.getTypeFromInterface(a.splice(1, a.length), mask[key], value)
          }
      } else if (path.indexOf(key) > -1){
        if (typeof mask[key] === "string") {
          return "" + value;
        } else if (typeof mask[key] === "number") {
          return parseInt(value);
        }
      }
    }
    return null
  };

  this.sizeOf = function (obj) {
    let size = 0;
    for (let {parent, node, key, path, deep} of new RecursiveIterator(obj)) {
      size++
    }
    return size;
  };

  this.getPathsOfQuery = function (query) {
    let paths = {};
    let q = query;
    if (typeof query === "string") {
      q = JSON.parse(query)
    }
    for (let {parent, node, key, path, deep} of new RecursiveIterator(q)) {
      if (typeof node !== "object") {
        if (!paths[node]) {
          paths[node] = [];
        }
        let build = "/" + path.join("/");
        paths[node].push(build)
      } else if (Object.keys(node).length == 0) {
        if (!paths["{}"]) {
          paths["{}"] = [];
        }
        let build = "/" + path.join("/");
        paths["{}"].push(build);
      }
    }
    return paths;
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

  this.sameArray = function (arr1, arr2) {
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
