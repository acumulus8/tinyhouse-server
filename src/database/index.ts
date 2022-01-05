import { MongoClient } from "mongodb";
import { Database } from "../lib/types";

const userName = process.env.DB_USER;
const password = process.env.DB_USER_PASSWORD;
const cluster = process.env.DB_CLUSTER;
const url = `mongodb+srv://${userName}:${password}@${cluster}.mongodb.net/main?retryWrites=true&w=majority`

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url);
  const db = client.db('main');

  return { listings: db.collection('test_listings')}
};