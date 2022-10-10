import { isVolumeReference } from '$lib/types/VolumeReference';
import { getVolumeCollection } from '.';

export async function getVolumeReference() {
	const collection = await getVolumeCollection();
	const volume = await collection.find({}).toArray();
	if (volume) {
		if (!volume.every(isVolumeReference)) {
			throw new Error('Invalid volume reference');
		}
		return volume.map((v) => ({ pair: v.pair, volUsdt: v.volUsdt }));
	}
	throw new Error('Unable to fetch volume reference');
}
