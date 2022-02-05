import crypto from "crypto";
import { Response, Request } from "express";
import { IResolvers } from "@graphql-tools/utils";
import { Google, Stripe } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { LogInArgs, ConnectStripeArgs } from "./types";
import { authorize } from "../../../lib/utils";

const cookieOptions = {
	httpOnly: true,
	sameSite: true,
	signed: true,
	secure: process.env.NODE_ENV === "development" ? false : true,
};

const logInViaGoogle = async (code: string, token: string, db: Database, res: Response): Promise<User | undefined> => {
	const { user } = await Google.logIn(code);
	if (!user) throw new Error("Google login error");

	//check for and assemble lists of data from google
	const userNamesList = user.names && user.names.length ? user.names : null;
	const userPhotosList = user.photos && user.photos.length ? user.photos : null;
	const userEmailsList = user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;
	//retrieve the relevant data from the lists
	const userName = userNamesList ? userNamesList[0].displayName : null;
	const userId = userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source ? userNamesList[0].metadata.source.id : null;
	const userAvatar = userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;
	const userEmail = userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

	if (!userId || !userName || !userAvatar || !userEmail) throw new Error("Google Login Error.");

	let viewer = await db.users.findOne({ id: userId });

	if (viewer) {
		viewer.name = userName;
		viewer.avatar = userAvatar;
		viewer.contact = userEmail;
		viewer.token = token;
		await viewer.save();
	} else {
		const newUser: User = {
			id: userId,
			token,
			name: userName,
			avatar: userAvatar,
			contact: userEmail,
			income: 0,
			bookings: [],
			listings: [],
		};

		viewer = await db.users.create(newUser).save();
	}

	res.cookie("viewer", userId, {
		...cookieOptions,
		maxAge: 365 * 24 * 60 * 60 * 1000,
	});

	return viewer;
};

const LogInViaCookie = async (token: string, db: Database, req: Request, res: Response): Promise<User | undefined> => {
	const viewer = await db.users.findOne({ id: req.signedCookies.viewer });

	if (viewer) {
		viewer.token = token;
		await viewer.save();
	} else {
		res.clearCookie("viewer", cookieOptions);
	}

	return viewer;
};

export const viewerResolvers: IResolvers = {
	Query: {
		authUrl: (): string => {
			try {
				return Google.authUrl;
			} catch (error) {
				throw new Error(`Failed to query Google Auth Url: ${error}`);
			}
		},
	},
	Mutation: {
		logIn: async (_root: undefined, { input }: LogInArgs, { db, req, res }: { db: Database; req: Request; res: Response }): Promise<Viewer> => {
			try {
				const code = input ? input.code : null;
				const token = crypto.randomBytes(16).toString("hex");
				const viewer: User | undefined = code ? await logInViaGoogle(code, token, db, res) : await LogInViaCookie(token, db, req, res);

				if (!viewer) {
					return { didRequest: true };
				}

				return {
					id: viewer.id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error(`Failed to log in: ${error}`);
			}
		},
		logOut: (_root: undefined, _args: Record<string, never>, { res }: { res: Response }) => {
			try {
				res.clearCookie("viewer", cookieOptions);
				return { didRequest: true };
			} catch (error) {
				throw new Error(`Failed to logout: ${error}`);
			}
		},
		connectStripe: async (_root: undefined, { input }: ConnectStripeArgs, { db, req }: { db: Database; req: Request }): Promise<Viewer> => {
			try {
				const { code } = input;

				const viewer = await authorize(db, req);
				if (!viewer) throw new Error("Viewer cannot be found");

				const wallet = await Stripe.connect(code);
				if (!wallet) throw new Error("Stripe grant error");

				viewer.walletId = wallet.stripe_user_id;
				await viewer.save();

				return {
					id: viewer.id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error(`Failed to connect with Stripe: ${error}`);
			}
		},
		disconnectStripe: async (_root: undefined, _args: Record<string, never>, { db, req }: { db: Database; req: Request }): Promise<Viewer> => {
			try {
				const viewer = await authorize(db, req);
				if (!viewer || !viewer.walletId) throw new Error("Viewer cannot be found");

				const wallet = await Stripe.disconnect(viewer.walletId);
				if (!wallet) throw new Error("Viewer cannot be found or has not connected to Stripe.");

				viewer.walletId = null;
				await viewer.save();

				return {
					id: viewer.id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error("Failed to disconnect with Stripe.");
			}
		},
	},
	Viewer: {
		hasWallet: (viewer: Viewer): boolean | undefined => {
			return viewer.walletId ? true : undefined;
		},
	},
};
