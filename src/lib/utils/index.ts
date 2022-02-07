import { Request } from "express";
import { Database } from "../types";
import { UserEntity } from "../../database/entity";

export const authorize = async (db: Database, req: Request): Promise<UserEntity | null> => {
	const token = await req.get("X-CSRF-TOKEN");
	const viewer = await db.users.findOne({
		id: req.signedCookies.viewer,
		token,
	});
	if (!viewer) return null;

	return viewer;
};

export const myMocky = `
{
	" name": "xxx.png",
	"status": "done",
	"url": "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
	"thumbUrl": "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
}
`;
