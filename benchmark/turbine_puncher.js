const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});
const numReq = 1000;
const EMPTY_OBJECT = "{}";

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

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function get(i) {
    if (i < numReq) {
        let user = await turbine.get("database", "/users/" + randomString());
        if (user && JSON.stringify(user) !== EMPTY_OBJECT) console.log(JSON.stringify(user));
        await get(i + 1)
    }
}

async function post(i) {
    if (i < numReq) {
        await turbine.post("database", "/users/" + randomString(), {
            name: randomString(),
            age: randomInt(100)
        });
        await post(i + 1)
    }
}

async function query(i) {
    if (i < numReq) {
        let users = await turbine.query("database", "/users/*", {
            age: randomInt(100)
        });
        console.log(JSON.stringify(users));
        await query(i + 1)
    }
}

async function test() {
    let started = new Date();
    await get(0);
    let duration = new Date() - started;
    logger.debug("getting " + numReq + " times -> finished in: " + (duration/1000) + " secs");

    started = new Date();
    await query(0);
    duration = new Date() - started;
    logger.debug("querying " + numReq + " times -> finished in: " + (duration/1000) + " secs");

    started = new Date();
    await post(0);
    duration = new Date() - started;
    logger.debug("setting " + numReq + " times -> finished in: " + (duration/1000) + " secs");
}

test().then(function() {
   console.log("finish!");
});