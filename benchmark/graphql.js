const express = require('express');

const expressGraphQL = require('express-graphql');
const schema = require('./schema.js');
const app = express();

const logjs = require('logjsx');
const logger = new logjs();
logger.init({
    level: "DEBUG"
});

app.use('/graphql', expressGraphQL({
    schema:schema,
    graphiql:true
}));

app.listen(3000, () => {
    logger.debug('Server running on port 3000');
});
