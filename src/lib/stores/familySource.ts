import { writable, type Writable } from 'svelte/store';

export enum FamilySource {
	Volume = 'volume',
	Cmc = 'cmc'
}

export const familySource = getFamilySourceStore();

function getFamilySourceStore() {
	let storeValue: FamilySource = FamilySource.Volume;
	const store: Writable<FamilySource> = writable(storeValue);
	const { subscribe, set } = store;
	return {
		subscribe,
		set(value: FamilySource) {
			storeValue = value;
			set(value as FamilySource);
			try {
				if (localStorage) {
					console.log('setFamilySource', value);
					localStorage.setItem('familySource', storeValue);
				}
			} catch (e) {
				console.error(e);
			}
		},
		update(fn: (value: FamilySource) => FamilySource) {
			const newStoreValue = fn(storeValue);
			this.set(newStoreValue);
		}
	};
}

// stores familySource value to localStorage and then update familySource
export function setFamilySource(source: FamilySource) {
	localStorage.setItem('familySource', source);
	familySource.set(source);
}

// read familySource value from localStorage and then update familySource
// don't forget to check if familySource value is valid
export function readFamilySource() {
	if (!globalThis.localStorage) {
		return;
	}
	const source = localStorage.getItem('familySource');
	if (source === FamilySource.Volume || source === FamilySource.Cmc) {
		familySource.set(source);
	}
}

/*
count.subscribe(value => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update(n => n + 1); // logs '2'
*/
