const RecursiveIterator = require('recursive-iterator');
const setIn = require('set-in');
const eol = "\r\n";

function PrintUtils() {

  this.getClusterPrintableInfo = (cluster_info) => {
    let msg = "";
    let current_machine = "";
    let current_worker_id = "";
    let current_database_name = "";

    let data_info = {};

    for (const cluster of cluster_info.responses) {
      let machine = cluster.machine;
      let worker_id = cluster.worker_id;

      let ops = cluster.response.ops;

      if (machine !== current_machine) {
        msg += this.worker_database_msg(msg, data_info);
        msg += `### ${machine} ### ${eol}`;
        current_machine = machine;
      }

      if (worker_id !== current_worker_id) {
        // msg += `\t ${worker_id} - ${ops} op/sec ${eol}`;
        current_worker_id = worker_id;
      }

      let databases_keys = Object.keys(cluster.response.databases);
      for (const key of databases_keys) {
        let database = cluster.response.databases[key];
        let name = database.name;
        let size = database.size;
        let time_delay_saving = cluster.response.time_delay_saving;

        if (data_info[name] === undefined) {
          data_info[name] = {}
        }

        if (data_info[name][current_worker_id] === undefined) {
          data_info[name][current_worker_id] = {}
        }

        data_info[name][current_worker_id].size = size;
        data_info[name][current_worker_id].time_delay_saving = time_delay_saving;
        data_info[name][current_worker_id].collections = Object.keys(database.collections).length;
      }

    }

    msg += this.worker_database_msg(msg, data_info);

    return msg;
  };

  this.worker_database_msg = (msg, data_info) => {
    let keys = Object.keys(data_info);
    if (keys.length > 0) {
      keys.forEach((database_name) => {
        let w_keys = Object.keys(data_info[database_name]);
        msg += `\t ${database_name}: ${eol}`;
        w_keys.forEach((worker_name) => {
          msg += `\t\t ${worker_name} => ${data_info[database_name][worker_name].size} bytes ${eol}`;
          msg += `\t\t\t size: ${data_info[database_name][worker_name].size} bytes ${eol}`;
          msg += `\t\t\t delay saving: ${data_info[database_name][worker_name].time_delay_saving} ms ${eol}`;
          msg += `\t\t\t collections: ${data_info[database_name][worker_name].collections} ${eol}`;
        })
      });
      data_info = {}
    }
    return msg;
  }

}

module.exports = PrintUtils;
