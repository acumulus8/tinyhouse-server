import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";
import { myMocky } from "./lib/utils";

const port = process.env.PORT;

const mount = async (app: Application) => {
	const db = await connectDatabase();

	app.use(cookieParser(process.env.SECRET));
	app.use(bodyParser.json({ limit: "2mb" }));
	app.post("/myMocky", (_req, res) => res.send(myMocky));

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => ({ db, req, res }),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
	});

	server.start().then(async () => {
		server.applyMiddleware({ app, path: "/api" });
		app.listen(port);

		console.log(`[app]: running at http://localhost:${port}`);
	});
};

mount(express());
