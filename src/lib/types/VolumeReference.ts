export type VolumeReference = { pair: string; volUsdt: number };

export function isVolumeReference(obj: unknown): obj is VolumeReference {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof (obj as VolumeReference).pair === 'string' &&
		typeof (obj as VolumeReference).volUsdt === 'number'
	);
}
