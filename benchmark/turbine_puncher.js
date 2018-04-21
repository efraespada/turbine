const rp = require('request-promise');
const SN = require('sync-node');
const queue = SN.createQueue();
const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});
const url = "http://localhost:4005/";
const numReq = 1000;
const EMPTY_OBJECT = {};

const Turbine = require('../index.js');
let turbine = new Turbine({
    "turbine_port": 4005,
    "turbine_ip": "http://localhost",
    "db_names": ["database","paths"],
    "debug": true
});


function randomString() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function ask(url, data) {
    return new Promise(function(resolve, reject) {
        let options = {
            method: 'POST',
            uri: url,
            body: data,
            json: true
        };
        rp(options)
            .then(function (parsedBody) {
                resolve(parsedBody)
            })
            .catch(function (err) {
                reject(err)
            });
    });
}
/*

async function post(i) {
    if (i < numReq) {
        await turbine.post("database", "/users/" + randomString(), {name: "jeje"});
        await post(i + 1)
    }
}

async function test() {
    let started = new Date();
    await post(0);
    let duration = new Date() - started;
    logger.debug("setting " + numReq + " times -> finished in: " + (duration/1000) + " secs");
    started = new Date();
}

test().then(function() {
   console.log("finish!");
});
*/


let started = new Date().getTime();

queue.pushJob(function(){
    logger.debug("getting " + numReq + " times");
});

for (let i = 0; i < numReq; i++) {
    let userToCheck = "/users/" + randomString();
    // let userToCheck = "/users/fUI";
    let data = {
        method: "get",
        database: "database",
        path: userToCheck
    };
    queue.pushJob(function(){
        return new Promise(function (resolve, reject) {
            ask(url, data).then(function(user) {
                if (typeof user === "string") {
                    logger.error("error: " + user);
                } else if (JSON.stringify(user) === JSON.stringify(EMPTY_OBJECT)) {
                    resolve()
                } else {
                    logger.debug("found: " + JSON.stringify(user));
                    resolve()
                }
            })

        })
    });

}

queue.pushJob(function(){
    let duration = new Date() - started;
    logger.debug("getting " + numReq + " times -> finished in: " + (duration/1000) + " secs");
});

/*
queue.pushJob(function(){
    started = new Date().getTime();
    logger.debug("setting " + numReq + " times");
});

for (let i = 0; i < numReq; i++) {
    let userToCheck = "/users/" + randomString();
    // let userToCheck = "/users/fUI";
    queue.pushJob(function() {
        return new Promise(function (resolve, reject) {
            let user = {};
            user.name = randomString();

            let write = {
                method: "post",
                database: "database",
                path: userToCheck,
                value: user
            };

            ask(url, write).then(function(res) {
                resolve()
            })
        })
    });

}

queue.pushJob(function(){
    let duration = new Date().getTime() - started;
    logger.debug("setting " + numReq + " times -> finished in: " + (duration/1000) + " secs");
});
*/

queue.pushJob(function(){
    started = new Date().getTime();
    logger.debug("querying " + numReq + " times");
});

for (let i = 0; i < numReq; i++) {
    let userToCheck = "/users/*";
    let data = {
        method: "query",
        database: "database",
        path: userToCheck,
        query: {
            name: "cFu"
        }
    };

    queue.pushJob(function(){
        return new Promise(function (resolve, reject) {
            ask(url, data).then(function(res) {
                if (typeof res === "string") {
                    logger.error("error: " + res);
                    resolve()
                } else if (JSON.stringify(res) === JSON.stringify(EMPTY_OBJECT)) {
                    resolve()
                } else {
                    logger.debug("found: " + JSON.stringify(res));
                    resolve()
                }
            })

        })
    });
}


queue.pushJob(function(){
    let duration = new Date().getTime() - started;
    logger.debug("querying " + numReq + " times -> finished in: " + (duration/1000) + " secs");
});

