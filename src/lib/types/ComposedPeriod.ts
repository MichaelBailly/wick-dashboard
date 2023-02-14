import type { Period } from '$lib/types/Period';

export type ComposedPeriod = {
	dates: {
		start: Date;
		end: Date;
	};
	unit: Period;
	value: string;
};
