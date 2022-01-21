import { Request } from "express";
import { ObjectId } from "mongodb";
import { Database, User } from "../types";

export const authorize = async (db: Database, req: Request): Promise<User | null> => {
	const token = await req.get("X-CSRF-TOKEN");
	console.log("TOKEN: ", token);
	console.log("SIGNED COOKIES: ", req.signedCookies.viewer);
	const viewer = await db.users.findOne({
		_id: req.signedCookies.viewer,
		token,
	});

	console.log("VIEWER: ", viewer);

	return viewer;
};
