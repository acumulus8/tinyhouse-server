import { MongoClient } from "mongodb";

const userName = 'timwilburn8';
const password = 'IEq8nb5FXfTSBnh8';
const cluster = 'cluster0.ao7ha';
const url = `mongodb+srv://${userName}:${password}}@${cluster}.mongodb.net/main?retryWrites=true&w=majority`

export const connectDatabase = async () => {
  const client = await MongoClient.connect(url);
  const db = client.db('main');

  return { listings: db.collection('test_listings')}
};