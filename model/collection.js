
function Collections(databases) {

    this.of = function(database) {
        return databases[database];
    };

    this.keys = function(database) {
        return Object.keys(this.of(database))
    }
}

module.exports = Collections;
