import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { useResolvers } from "./User";
import { listingResolvers } from "./Listing";
import { bookingResolvers } from "./Booking";

export const resolvers = merge(viewerResolvers, useResolvers, listingResolvers, bookingResolvers);
