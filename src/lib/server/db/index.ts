import { MongoClient } from 'mongodb';
import { MONGO_DB } from '../../constants.server';

let client: MongoClient | null = null;

export async function getClient() {
	if (!client) {
		client = await new MongoClient(MONGO_DB).connect();
	}
	return client;
}

export async function getTradeCollection() {
	const client = await getClient();
	return client.db().collection('trades');
}
