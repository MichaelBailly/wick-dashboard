import { getVolumeCollection } from '.';

export async function getVolumeReference() {
	const collection = await getVolumeCollection();
	const volume = await collection.find({}).toArray();
	if (volume) {
		if (volume.length === 0) {
			console.log('No volume reference found');
		}
		return volume;
	}
	throw new Error('Unable to fetch volume reference');
}
