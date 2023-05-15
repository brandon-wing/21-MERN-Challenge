//require all the necessary items to get the server up and running
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
//this will be used for graphQL
const { typeDefs, resolvers } = require('./schemas');
//we will use this for user authorization/jwt tokens
const { authMiddleware } = require('./utils/auth');

const db = require('./config/connection');
//express
const app = express();
//apollo server connection
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
//more middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//if the server is being run in production mode, run the server in a production environment
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  //When a client makes a GET request to the root URL, they receive the index.html file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  

// this will start the server
const startApolloServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
    
    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
      })
    })
    };
    
  // Call the async function to start the server
    startApolloServer();
