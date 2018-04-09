[ ![@efraespada/turbine](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.0.2&x2=0)](https://www.npmjs.com/package/@efraespada/turbine)

# Turbine
Turbine allows different node processes to work with the same JSON database. It works as a service receiving requests and returning, storing or querying data as quick as possible.

### The problem
I have multiple clusters working with the same data. For them it isn't an effort to read from a JSON database and work with data. The problem appears when those clusters **try** to store data on database at the same time.

Multiple processes working with the same file can produce writing errors. Imagine the consequences.

### The solution
Turbine is a single process that manages a JSON database for you. It allows to work with the same data on different clusters or processes avoiding fatal errors writing on database. It has been designed for [Rotor server](https://github.com/rotorlab/server-node) but can be used as a query engine.

### Benchmark
For check how fast is Turbine, there is a performance comparision with [GraphQL engine](http://graphql.org). Both are used as servers that receive requests and do some process.
Additionally, both servers work with pre-loaded data.

|Action  |GraphQL  |Turbine| Times |
|---|---|---|---|
| GET  | 37.6 s. | 2.7 s. | x1000
| POST  | 2.5 s. | 2.1 s. | x1000
| QUERY  | 46.9 s. | 2.1 s. | x1000

For more details, check [benchmark](https://github.com/rotorlab/server-node/tree/master/benchmark) page.

### Installation
```bash
npm install @efraespada/turbine --save
```

### Usage
The idea is to start a server (in Process A) and all processes (Process A, Cluster A, Cluster B, Process B, Process C) are able to ask for data.
<p align="center"><img width="60%" vspace="20" src="https://raw.githubusercontent.com/rotorlab/server-node/master/images/TurbineSchema.png"></p>

#### prepare Turbine
```javascript
const Turbine = require('@rotor-server/turbine');
let turbine = new Turbine({
    "turbine_port": 4004,
    "turbine_ip": "http://localhost",
    "db_name": "database",
    "debug": true
});
```
#### server
Starts Turbine server on a different process. This should be called first when your API is starting.
```javascript
turbine.server();
```
```bash
╭───────────────────╮
│                   │
│                   │
│      turbine      │
│                   │
│                   │
╰───────────────────╯
starting ..
Indexed 22793.
started on 4005 (15.749 secs)
0 op/sec
```
Once Turbine is started, you can use client methods.
#### get
Client method that looks for an object on the given path.
```javascript
turbine.get("/users/usersA").then(function(user) {
    console.log(JSON.stringify(user))
}
```
#### post
Client method that updates or removes an object on the given path passing another object or null.
```javascript
turbine.post("/users/usersB", newUser).then(function() {
    console.log("stored")
}
```
#### query
Client method that looks for an object on the given path for the conditions passed.
```javascript
turbine.query("/users/*", { name: "Matt" }).then(function(users) {
    for (let user in users) {
        console.log(JSON.stringify(users[user]))
    }
});
```

### Usage on clusters
```node
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const Turbine = require('@rotor-server/turbine');

let turbine = new Turbine({
    "turbine_port": 4004,
    "turbine_ip": "http://localhost",
    "db_name": "database",
    "debug": true
});

let port = 3003;

if (cluster.isMaster) {
    turbine.server();

    let workers = [];
    let spawn = function (i) {
        workers[i] = cluster.fork();
        workers[i].on('exit', function (code, signal) {
            console.log('respawning worker ' + i);
            spawn(i);
        });
    };
    for (let i = 0; i < numCPUs; i++) {
        spawn(i);
    }
} else {
    var app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(timeout('120s'));
    app.route('/')
        // turbine server has been started, start managing data
        .get(async function (req, res) {
            if (req.body.query !== undefined) {
                let object = await turbine.query(req.body.path, req.body.query);
                res.json(object);
            } else {
                let object = await turbine.get(req.body.path);
                res.json(object);
            }
        })
        .post(async function (req, res) {
            await turbine.post(req.body.path, req.body.content);
            res.json({});
        });
    app.listen(port, function () {
        console.log("cluster started on port " + port + " | worker => " + cluster.worker.id);
    });
}

```

License
-------
    Copyright 2018 Efraín Espada

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
