import { IResolvers } from "@graphql-tools/utils";
import crypto from "crypto";
import { Request } from "express";
import { Google, Cloudinary } from "../../../lib/api";
import { authorize } from "../../../lib/utils";
import { Listing, Database, User, ListingType } from "../../../lib/types";
import {
	ListingArgs,
	ListingBookingsArgs,
	ListingBookingsData,
	ListingsData,
	ListingsArgs,
	ListingsFilter,
	ListingsQuery,
	HostListingArgs,
	HostListingInput,
	Order,
} from "./types";

const verifyHostListingInput = ({ title, description, type, price }: HostListingInput) => {
	if (title.length > 100) {
		throw new Error("listing title must be less than 100 characters");
	}
	if (description.length > 5000) {
		throw new Error("listing description must be under 5000 characters");
	}
	if (type !== ListingType.Apartment && type !== ListingType.House) {
		throw new Error("listing type must either be a listing or a house");
	}
	if (price < 0) {
		throw new Error("price must be greater than 0");
	}
};

export const listingResolvers: IResolvers = {
	Query: {
		listing: async (_root: undefined, { id }: ListingArgs, { db, req }: { db: Database; req: Request }): Promise<Listing> => {
			try {
				const listing = (await db.listings.findOne({ id: id })) as Listing;
				if (!listing) throw new Error("Listing can't be found");

				const viewer = await authorize(db, req);
				if (viewer && viewer.id === listing.host) {
					listing.authorized = true;
				}

				return listing;
			} catch (error) {
				throw new Error(`Failed to query the listing: ${error}`);
			}
		},
		listings: async (_root: undefined, { location, filter, limit, page }: ListingsArgs, { db }: { db: Database }): Promise<ListingsData> => {
			try {
				const query: ListingsQuery = {};
				const data: ListingsData = {
					region: null,
					total: 0,
					result: [],
				};

				if (location) {
					const { country, admin, city } = await Google.geocode(location);

					if (city) query.city = city;
					if (admin) query.admin = admin;
					if (country) {
						query.country = country;
					} else {
						throw new Error("No country was found");
					}
					const cityText = city ? `${city}, ` : "";
					const adminText = admin ? `${admin}, ` : "";
					data.region = `${cityText}${adminText}${country}`;
				}

				let order: Order | null = null;

				if (filter && filter == ListingsFilter.PRICE_LOW_TO_HIGH) {
					order = { price: "ASC" };
				}

				if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
					order = { price: "DESC" };
				}

				const count = await db.listings.count(query);
				const listings = await db.listings.find({
					where: { ...query },
					order: { ...order },
					skip: page > 0 ? (page - 1) * limit : 0,
					take: limit,
				});

				data.total = count;
				data.result = listings;

				return data;
			} catch (error) {
				throw new Error(`Failed to query listings: ${error}`);
			}
		},
	},
	Listing: {
		host: async (listing: Listing, _args: Record<string, null>, { db }: { db: Database }): Promise<User> => {
			const host = await db.users.findOne({ id: listing.host });
			if (!host) {
				throw new Error("host can't be found");
			}
			return host;
		},
		bookingsIndex: (listing: Listing): string => {
			return JSON.stringify(listing.bookingsIndex);
		},
		bookings: async (listing: Listing, { limit, page }: ListingBookingsArgs, { db }: { db: Database }): Promise<ListingBookingsData | null> => {
			try {
				if (!listing.authorized) {
					return null;
				}

				const data: ListingBookingsData = {
					total: 0,
					result: [],
				};

				const bookings = await db.bookings.findByIds(listing.bookings, {
					skip: page > 0 ? (page - 1) * limit : 0,
					take: limit,
				});

				data.total = listing.bookings.length;
				data.result = bookings;

				return data;
			} catch (error) {
				throw new Error(`Failed to query listing bookings: ${error}`);
			}
		},
	},
	Mutation: {
		hostListing: async (_root: undefined, { input }: HostListingArgs, { db, req }: { db: Database; req: Request }): Promise<Listing> => {
			verifyHostListingInput(input);

			const viewer = await authorize(db, req);
			if (!viewer) throw new Error("Viewer cannot be found");

			const { country, admin, city } = await Google.geocode(input.address);
			if (!country || !admin || !city) throw new Error("Invalid address input.");

			const imageUrl = await Cloudinary.upload(input.image);

			const newListing: Listing = {
				id: crypto.randomBytes(16).toString("hex"),
				...input,
				image: imageUrl,
				bookings: [],
				bookingsIndex: {},
				country,
				admin,
				city,
				host: viewer.id,
			};

			const insertedListing: Listing = await db.listings.create(newListing).save();

			viewer.listings.push(insertedListing.id);
			await viewer.save();

			return insertedListing;
		},
	},
};
