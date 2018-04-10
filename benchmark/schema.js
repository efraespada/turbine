const JsonDB = require('node-json-db');
const Interval = require('Interval');
const SN = require('sync-node');
const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const SLASH = "/";
const database = new JsonDB("database", true, true);
let data = database.getData(SLASH);
const queue = SN.createQueue();

/**
 * backup every 5 seconds
 */
let count = 0;
Interval.run(function () {
    queue.pushJob(function () {
        ++count;
        try {
            database.push(SLASH, data);
        } catch (e) {
            logger.error("error on data backup: " + e)
        }
        logger.debug("backup times: " + count);
    })
}, 5000);

// Customer Type
const UserType = new GraphQLObjectType({
    name:'User',
    fields:() => ({
        name: {type: GraphQLString},
    })
});

/*

query UserQueries {
  user(id: "ayv") {
    name
  }
}

query UserQueries {
  users {
    name
  }
}

 */

// Root Query
const RootQuery= new GraphQLObjectType({
    name:'UserQueries',
    fields:{
        user:{
            type:UserType,
            args:{
                id:{type:GraphQLString}
            },
            resolve(parentValue, args){
                let keys = Object.keys(data.users);
                for (let i = 0; i < keys.length; i++) {
                    if (keys[i] === args.id) {
                        return data.users[keys[i]];
                    }
                }
            }
        },
        userByName:{
            type: new GraphQLList(UserType),
            args:{
                name:{type:GraphQLString}
            },
            resolve(parentValue, args){
                let keys = Object.keys(data.users);
                let usersF = [];
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if (data.users[key].name === args.name) {
                        usersF.push(data.users[key]);
                    }
                }
                return usersF;
            }
        },
        users:{
            type: new GraphQLList(UserType),
            resolve(parentValue, args){
                return Object.values(data.users);
            }
        }
    }
});

/*

mutation Mutation {
  addUser(id: "sdf", name: "dsf"){
    name
  }
}

 */
// Mutations
const mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addUser:{
            type:UserType,
            args:{
                id: {type: new GraphQLNonNull(GraphQLString)},
                name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args){
                let user = {};
                user.name = args.name;
                data.users[args.id] = user;
                return data.users[args.id];
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});