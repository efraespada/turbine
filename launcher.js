const Turbine = require('./index.js');
let turbine = new Turbine(require("./config.json"));
turbine.server();


async function test() {
    /*
    let j = {
        name: "Juan",
        age: 20
    };

    let response = await turbine.post("database","/users/" + new Date().getTime(), j);
    console.log(response);
    let p = {
        name: "Pedro",
        age: 24
    };

    response = await turbine.post("database","/users/" + new Date().getTime(), p);
    console.log(response);
    */


    let inter = {
        users: {
            _: ""
        }
    };
    let query = {
        age: 20
    };

    /*let users = await turbine.query("database","/users/*", query, inter);
    for (let user in users) {
        console.log(JSON.stringify(user))
    }*/

    let response = await turbine.get("database","/", inter);
    console.log("1525019037169: " + JSON.stringify(response));
}

setTimeout(function () {
    test().then(function() {
        console.log("finish")
    });
}, 3000);

