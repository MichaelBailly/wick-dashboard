import { getVolumeCollection } from '.';

export async function getVolumeReference() {
	const collection = await getVolumeCollection();
	const volume = await collection.find({}).toArray();
	if (volume) {
		return volume;
	}
	throw new Error('Unable to fetch volume reference');
}
