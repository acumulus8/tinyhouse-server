import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import compression from "compression";
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
	app.use(compression());
	app.use(express.static(`${__dirname}/client`));
	app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`));
	app.post("/myMocky", (_req, res) => res.send(myMocky));

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => ({ db, req, res }),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
		cache: "bounded",
		introspection: true,
	});

	server.start().then(async () => {
		server.applyMiddleware({ app, path: "/api" });
		app.listen(port);

		console.log(`[app]: running at http://localhost:${port}/api`);
	});
};

mount(express());
