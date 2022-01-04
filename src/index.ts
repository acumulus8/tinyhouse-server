import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";

const port = 9000;

const mount = async (app: Application) => {
  const db = await connectDatabase();
  const server = new ApolloServer({ 
    typeDefs,
    resolvers,
    context: () => ({db}),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground] 
  });
  
  server.start()
    .then(async () => {
      server.applyMiddleware({ app, path: '/api' })
      app.listen(port);
      console.log(`[app]: http://localhost:${port}`);
      const listings = await db.listings.find({}).toArray();
      console.log(listings)
    })

}

mount(express())




