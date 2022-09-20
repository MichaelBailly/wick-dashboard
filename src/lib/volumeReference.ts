export const VolumeFamilies = [
	{
		name: 'micro',
		label: 'Micro',
		min: 0,
		max: 800000
	},
	{
		name: 'small',
		label: 'Small',
		min: 800000,
		max: 2000000
	},
	{
		name: 'medium',
		label: 'Medium',
		min: 2000000,
		max: 5000000
	},
	{
		name: 'large',
		label: 'Large',
		min: 5000000,
		max: 10000000
	},
	{
		name: 'xlarge',
		label: 'X-Large',
		min: 10000000,
		max: 2000000000000
	}
];

const pairVolumeFamily: Map<string, string> = new Map();

export function getVolumeFamily(volume: string) {
	return pairVolumeFamily.get(volume);
}

export function loadReference(reference: { pair: string; volUsdt: number }[]) {
	for (const { pair, volUsdt } of reference) {
		const family = VolumeFamilies.find((f) => volUsdt >= f.min && volUsdt < f.max);
		if (family) {
			pairVolumeFamily.set(pair, family.name);
		}
	}
}
