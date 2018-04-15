const Turbine = require('./index.js');
let turbine = new Turbine(require("./config.json"));
turbine.server();

/*
setTimeout(async function () {
    let user = await turbine.get("/users/usersA");
    console.log(JSON.stringify(user));

    user = {};
    user.name = "Matt";
    user.age = 24;
    await turbine.post("/users/usersA", user);
    console.log("stored");

    let users = await turbine.query("/users/*", { name: "Matt", age: 24 });
    if (users.length === 0) {
        console.log("no items found")
    }
    for (let user in users) {
        console.log("item: " + JSON.stringify(users[user]))
    }
}, 20000);
*/


