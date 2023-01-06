import { writable, type Writable } from 'svelte/store';

export const lightInterface: Writable<boolean> = writable(false);
