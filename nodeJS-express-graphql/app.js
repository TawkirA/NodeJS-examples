const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers");
const { default: mongoose } = require('mongoose');

const app = express()

app.use(
    "/graphql",
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolvers,
        graphiql: true 
    })
)

const uri = 'mongodb://0.0.0.0:27017/express-graphql';
const options = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose.connect(uri, options)
        .then(() => app.listen(3000, () => console.log("Server is running at port 3000")))
        .catch(error => {
            throw error
        })