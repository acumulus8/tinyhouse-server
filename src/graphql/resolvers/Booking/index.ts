import { IResolvers } from "@graphql-tools/utils";
import crypto from "crypto";
import { Request } from "express";
import { CreateBookingArgs } from "./types";
import { Booking, Database, Listing, BookingsIndex } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { Stripe } from "../../../lib/api/Stripe";

const millisecondsPerDay = 8400000;

export const resolveBookingsIndex = (bookingsIndex: BookingsIndex, checkInDate: string, checkOutDate: string): BookingsIndex => {
	let dateCursor = new Date(checkInDate);
	const checkOut = new Date(checkOutDate);
	const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

	while (dateCursor <= checkOut) {
		const y = dateCursor.getUTCFullYear();
		const m = dateCursor.getUTCMonth();
		const d = dateCursor.getUTCDate();

		if (!newBookingsIndex[y]) newBookingsIndex[y] = {};
		if (!newBookingsIndex[y][m]) newBookingsIndex[y][m] = {};
		if (!newBookingsIndex[y][m][d]) {
			newBookingsIndex[y][m][d] = true;
		} else {
			throw new Error("Selected dates can't overlap dates that have already been booked.");
		}

		dateCursor = new Date(dateCursor.getTime() + 86400000);
	}

	return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
	Booking: {
		id: (booking: Booking): string => {
			return booking.id.toString();
		},
		listing: (booking: Booking, _args: Record<string, never>, { db }: { db: Database }): Promise<Listing | null> => {
			return db.listings.findOne({ id: booking.listing });
		},
		tenant: (booking: Booking, _args: Record<string, never>, { db }: { db: Database }) => {
			return db.users.findOne({ id: booking.tenant });
		},
	},
	Mutation: {
		createBooking: async (_root: undefined, { input }: CreateBookingArgs, { db, req }: { db: Database; req: Request }): Promise<Booking> => {
			try {
				const { id, source, checkIn, checkOut } = input;

				const viewer = await authorize(db, req);
				if (!viewer) throw new Error("Viewer cannot be found");

				const listing = await db.listings.findOne({ id });
				if (!listing) throw new Error("Listing can't be found");
				if (listing.host === viewer.id) throw new Error("Viewer cannot book their own listing.");

				const today = new Date();
				const checkInDate = new Date(checkIn);
				const checkOutDate = new Date(checkOut);

				if (checkInDate.getTime() > today.getTime() + 90 * millisecondsPerDay)
					throw new Error("check in date can't be more than 90 days from today");
				if (checkOutDate.getTime() > today.getTime() + 90 * millisecondsPerDay)
					throw new Error("check out date can't be more than 90 days from the check in date");
				if (checkOutDate < checkInDate) throw new Error("Check out date can't be before check in date.");

				const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

				const totalPrice = listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay + 1);

				const host = await db.users.findOne({ id: listing.host });
				if (!host || !host.walletId) throw new Error("The host either can't be found of is not connected with Stripe");

				await Stripe.charge(totalPrice, source, host.walletId);

				const newBooking: Booking = {
					id: crypto.randomBytes(16).toString("hex"),
					listing: listing.id,
					tenant: viewer.id,
					checkIn,
					checkOut,
				};

				const insertedBooking: Booking = await db.bookings.create(newBooking);

				host.income = host.income + totalPrice;
				await host.save();

				viewer.bookings.push(insertedBooking.id);
				await viewer.save();

				listing.bookingsIndex = bookingsIndex;
				listing.bookings.push(insertedBooking.id);
				await listing.save();

				return insertedBooking;
			} catch (error) {
				throw new Error(`Failed to create a booking: ${error}`);
			}
		},
	},
};
