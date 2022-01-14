import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { useResolvers } from "./user";

export const resolvers = merge(viewerResolvers, useResolvers);
