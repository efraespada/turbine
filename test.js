const logjs = require('logjsx');
const Turbine = require('./index');
const turbine = new Turbine({
  server: {
    protect: false
  }
});
const client = turbine.client();

const logger = new logjs();

const namesM = ["Marcos", "Hugo", "Juan", "Pablo", "Mario", "Adrian", "Walter", "Antonio", "Manolo", "Miguel",
  "Julio", "Pau", "Kobe", "Ted", "Harry", "Harrison", "Efraín", "Javier", "Alberto", "Albert", "Luis", "Bruno", "Fernando"];

const namesW = ["Cristina", "Marta", "Raquel", "Lucia", "María", "Alejandra", "Luz", "Paola", "Valvanera", "Beatriz",
  "Mercedes", "Rose", "Rosa", "Sonia", "Paz", "Isabel", "Silvia", "Rosanna", "Inés", "Pilar", "Juana", "Daniela", "Sara"];

const surname = ["Espada", "Fraile", "Martinez", "Fernandez", "Molina", "Espinel", "De Pablo", "Alonso", "Bilbao", "Guzmán",
  "Ramos", "Sánchez", "Guevara", "Lopez", "Gutierrez", "Cameron", "Lucas", "Spielberg", "García", "Skywalker", "Solo", "Organa", "Kenobi"];

logger.init({
  level: "DEBUG"
});
const numReq = 100;

function randomString(lenght) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < lenght; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function get(i = 0) {
  if (i < numReq) {
    let user = await client.get("database", "/users/" + randomString(28));
    // if (user && JSON.stringify(user) !== EMPTY_OBJECT) console.log(JSON.stringify(user));
    await get(i + 1)
  }
}

async function post(i = 0) {
  if (i < numReq) {
    let uid = randomString(28);
    let man = randomInt(10) % 2 == 0;
    let name;
    if (man) {
      name = randomOf(namesM) + " " + randomOf(surname) + " " + randomOf(surname)
    } else {
      name = randomOf(namesW) + " " + randomOf(surname) + " " + randomOf(surname)
    }
    await client.post("database", "/users/" + uid, {
      email: randomString(7) + "@gmail.com",
      name: name,
      age: randomInt(100),
      os: "android",
      photo: "https://lh4.googleusercontent.com/-Ynmq9xxHmIk/AAAAAAAAAAI/AAAAAAAALcM/LkQv23S5zGg/s96-c/photo.jpg",
      steps: randomInt(9999),
      token: randomString(16),
      type: "sit",
      uid: uid,
      locations: {
        1527974462454: {
          altitude: randomInt(800),
          latitude: randomInt(50),
          longitude: randomInt(50),
          speed: 0.26559666
        },
        1527974462455: {
          altitude: randomInt(800),
          latitude: randomInt(50),
          longitude: randomInt(50),
          speed: 0.26559666
        },
        1527974462456: {
          altitude: randomInt(800),
          latitude: randomInt(50),
          longitude: randomInt(50),
          speed: 0.26559666
        }
      }
    });
    await post(i + 1);
  }
}

async function query(i = 0) {
  if (i < numReq) {
    let users = await client.query("database", "/users/*", {
      age: randomInt(100)
    }, {
      uid: ""
    });
    /*

    let users = await turbine.query("database", "/chats/*", {
        members: {
            "*": {
                id: "UB9D5Lx8AqTO4EoyLcx4y6GB19w2"
            }
        }
    }, {
        id: ""
    });

     */
    // console.log(JSON.stringify(users));
    await query(i + 1);
  }
}

async function test() {
  let started = new Date();
  await get();
  let duration = new Date() - started;
  console.log("");
  logger.info("get " + numReq + " times [" + (duration / 1000) + " secs]");

  started = new Date();
  await query(0);
  duration = new Date() - started;
  console.log("");
  logger.info("query " + numReq + " times [" + (duration / 1000) + " secs]");

  started = new Date();
  await post(0);
  duration = new Date() - started;
  console.log("");
  logger.info("post " + numReq + " times [" + (duration / 1000) + " secs]");
}

function randomOf(list = []) {
  return list[randomInt(list.length)];
}


/**
 * Testing get all user endpoint
 */
describe('running puncher', function () {
  this.timeout(500000);
  it('turbine server is OK', function (done) {
    setTimeout(function () {
      test().then(function () {
        logger.info("finish!");
        turbine.stopServer();
        done()
      });
    }, 2000);
  });
});
