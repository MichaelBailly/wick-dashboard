import { getVolumeReference } from '$lib/server/db/references';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	const volumeReferences = await getVolumeReference();
	console.log('volumeReferences', volumeReferences.length);
	return {
		volumeReference: volumeReferences.map((v) => ({ pair: v.pair, volUsdt: v.volUsdt }))
	};
}
