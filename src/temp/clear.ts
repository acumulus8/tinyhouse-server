import "dotenv/config";
import { connectDatabase } from "../database";

const clear = async () => {
	try {
<<<<<<< HEAD
		console.log("[clear] : running...");

		const db = await connectDatabase();

		await db.bookings.clear();
		await db.listings.clear();
		await db.users.clear();

		console.log("[clear] : success");
	} catch {
		throw new Error("failed to clear database");
=======
		console.log("[clear]: running...");
		const db = await connectDatabase();

		const bookings = await db.bookings.find({}).toArray();
		const listings = await db.listings.find({}).toArray();
		const users = await db.users.find({}).toArray();

		if (bookings.length > 0) await db.bookings.drop();
		if (listings.length > 0) await db.listings.drop();
		if (users.length > 0) await db.users.drop();

		console.log("[clear]: database clearing was successful!");
	} catch (error) {
		console.log("[error]: ", error);
		throw new Error("failed to clear the database");
>>>>>>> master
	}
};

clear();
