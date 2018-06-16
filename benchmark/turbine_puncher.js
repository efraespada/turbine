const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});
const numReq = 10000;
const EMPTY_OBJECT = "{}";

const Turbine = require('../index.js');
let turbine = new Turbine({
    "turbine_port": 4005,
    "turbine_ip": "http://localhost",
    "databases": ["database","paths"],
    "debug": true
});

function randomString() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function get(i = 0) {
    if (i < numReq) {
        let user = await turbine.get("database", "/users/" + randomString());
        // if (user && JSON.stringify(user) !== EMPTY_OBJECT) console.log(JSON.stringify(user));
        await get(i + 1)
    }
}

async function post(i = 0) {
    if (i < numReq) {
        await turbine.post("database", "/users/" + randomString(), {
            name: randomString(),
            age: randomInt(100)
        });
        await post(i + 1)
    }
}

async function query(i = 0) {
    if (i < numReq) {
        let users = await turbine.query("database", "/users/*", {
            name: randomString()
        });
        await query(i + 1)
    }
}

async function test() {

    let started = new Date();
    await get();
    let duration = new Date() - started;
    logger.info("get " + numReq + " times [" + (duration/1000) + " secs]");

    started = new Date();
    await query();
    duration = new Date() - started;
    logger.info("query " + numReq + " times [" + (duration/1000) + " secs]");

    started = new Date();
    await post();
    duration = new Date() - started;
    logger.info("set " + numReq + " times [" + (duration/1000) + " secs]");
}

test().then(function() {
    logger.info("finish!");
});
