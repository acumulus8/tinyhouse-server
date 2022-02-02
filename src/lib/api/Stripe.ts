import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, null);

export const Stripe = {
	connect: async (code: string) => {
		const response = await client.oauth.token({
			code,
			grant_type: "authorization_code",
		});

		return response;
	},
	charge: async (amount: number, source: string, stripeAccount: string) => {
		try {
			const res = await client.charges.create(
				{
					amount,
					currency: "usd",
					source,
					application_fee_amount: Math.round(amount * 0.05),
				},
				{
					stripeAccount,
				}
			);

			if (res.status !== "succeeded") throw new Error("Fialed to create charge with Stripe");
		} catch (error) {
			throw new Error(`Failed to charge the booker: ${error}`);
		}
	},
};
