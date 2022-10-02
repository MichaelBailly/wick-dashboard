export const VolumeFamilies = [
	{
		name: 'xs',
		label: 'Micro',
		min: 0,
		max: 800000
	},
	{
		name: 's',
		label: 'Small',
		min: 800000,
		max: 2000000
	},
	{
		name: 'm',
		label: 'Medium',
		min: 2000000,
		max: 5000000
	},
	{
		name: 'l',
		label: 'Large',
		min: 5000000,
		max: 10000000
	},
	{
		name: 'xl',
		label: 'X-Large',
		min: 10000000,
		max: 2000000000000
	}
];

let volumeReference: { pair: string; volUsdt: number }[] = [];
const pairVolumeFamily: Map<string, string> = new Map();

export function getVolumeFamily(pair: string) {
	return pairVolumeFamily.get(pair);
}

export function getFamilyLabel(familyName: string) {
	const family = VolumeFamilies.find((f) => f.name === familyName);
	return family ? family.label : '';
}

export function loadReference(reference: { pair: string; volUsdt: number }[]) {
	volumeReference = reference;
	for (const { pair, volUsdt } of reference) {
		const family = VolumeFamilies.find((f) => volUsdt >= f.min && volUsdt < f.max);
		if (family) {
			pairVolumeFamily.set(pair, family.name);
		}
	}
}

export function getReference() {
	return [...volumeReference];
}
