import { IResolvers } from "@graphql-tools/utils";

export const useResolvers: IResolvers = {
	Query: {
		user: () => {
			return "Query.user";
		},
	},
};
