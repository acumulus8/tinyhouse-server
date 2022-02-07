import { createConnection } from "typeorm";
import { Database } from "../lib/types";
import { ListingEntity, BookingEntity, UserEntity } from "./entity";

// const userName = process.env.DB_USER;
// const password = process.env.DB_USER_PASSWORD;
// const cluster = process.env.DB_CLUSTER;

export const connectDatabase = async (): Promise<Database> => {
	const connection = await createConnection();

	return {
		listings: connection.getRepository(ListingEntity),
		bookings: connection.getRepository(BookingEntity),
		users: connection.getTreeRepository(UserEntity),
	};
};
