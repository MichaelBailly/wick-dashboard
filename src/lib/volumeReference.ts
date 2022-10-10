export enum FamilyId {
	xs = 'xs',
	s = 's',
	m = 'm',
	l = 'l',
	xl = 'xl',
	unknown = 'unknown'
}

/**
 * @description families of volume reference types
 */
export const VolumeFamilies = [
	{
		name: FamilyId.xs,
		label: 'Micro',
		min: 0,
		max: 800000
	},
	{
		name: FamilyId.s,
		label: 'Small',
		min: 800000,
		max: 2000000
	},
	{
		name: FamilyId.m,
		label: 'Medium',
		min: 2000000,
		max: 5000000
	},
	{
		name: FamilyId.l,
		label: 'Large',
		min: 5000000,
		max: 10000000
	},
	{
		name: FamilyId.xl,
		label: 'X-Large',
		min: 10000000,
		max: 2000000000000
	}
];

let volumeReference: { pair: string; volUsdt: number }[] = [];
const pairVolumeFamily: Map<string, FamilyId> = new Map();

/**
 * @description get volume family name for a pair
 */
export function getVolumeFamily(pair: string) {
	return pairVolumeFamily.get(pair) || FamilyId.unknown;
}

/**
 * @description get label of a volume family name
 */
export function getFamilyLabel(familyName: string) {
	const family = VolumeFamilies.find((f) => f.name === familyName);
	return family ? family.label : '';
}

/**
 * @description load volume reference data
 */
export function loadReference(reference: { pair: string; volUsdt: number }[]) {
	volumeReference = reference;
	pairVolumeFamily.clear();
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

export function isVolumeFamilyId(obj: unknown): obj is FamilyId {
	return typeof obj === 'string' && Object.values(FamilyId).includes(obj as FamilyId);
}
