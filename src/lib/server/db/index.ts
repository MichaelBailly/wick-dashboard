import { MongoClient } from 'mongodb';
import {
	MONGO_DB,
	MONGO_REFERENCES_DB,
	MONGO_TRADE_COLLECTION,
	MONGO_VOLUME_COLLECTION
} from '../../constants.server';

let clients: Map<string, MongoClient> = new Map();

export async function getClient() {
	return getClientInternal(MONGO_DB);
}

export async function getReferenceClient() {
	return getClientInternal(MONGO_REFERENCES_DB);
}

export async function getTradeCollection() {
	const client = await getClient();
	return client.db().collection(MONGO_TRADE_COLLECTION);
}

export async function getVolumeCollection() {
	const client = await getReferenceClient();
	return client.db().collection(MONGO_VOLUME_COLLECTION);
}

async function getClientInternal(db: string) {
	if (clients.has(db)) {
		const clientOk = clients.get(db);
		if (clientOk) {
			return clientOk;
		}
	}

	const client = await new MongoClient(db).connect();

	clients.set(db, client);
	return client;
}
