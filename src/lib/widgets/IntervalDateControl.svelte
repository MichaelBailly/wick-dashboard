<script lang="ts">
	import { page } from '$app/stores';
	import { Period } from '$lib/types/Period';

	import {
		changeComposedPeriodUnit,
		getNextComposedPeriod,
		getPreviousComposedPeriod,
		getThisMonthComposedPeriod,
		getTodayComposedPeriod,
		parseComposedPeriod,
		stringifyComposedPeriod
	} from '$lib/composedPeriod';
	import Button, { Group, Icon, Label } from '@smui/button';
	import { format } from 'date-fns';
	export let url: URL;
	export let searchParamKey: string = 'period';

	export let oneLiner: boolean = false;
	export let controlSpace: boolean = false;

	const tag = '__REPLACEMENT__';

	let periodObj = getThisMonthComposedPeriod();
	let urlBase: Function = (str: string) => {
		return str;
	};

	$: {
		const urlCopy = new URL(url);
		urlCopy.searchParams.set(searchParamKey, tag);
		const urlStr = urlCopy.toString();
		urlBase = (str: string) => {
			return urlStr.replace(tag, str);
		};
	}

	$: {
		periodObj = getThisMonthComposedPeriod();
		const urlPeriod = $page.url.searchParams.get(searchParamKey);
		if (urlPeriod) {
			const composed = parseComposedPeriod(urlPeriod);
			if (composed) {
				periodObj = composed;
			}
		}
	}
</script>

<div class="controls-container" class:oneLiner class:controlSpace>
	<div>
		<Button
			href={urlBase(stringifyComposedPeriod(getPreviousComposedPeriod(periodObj)))}
			data-sveltekit-preload-data="hover">
			<Icon class="material-icons">chevron_left</Icon>
		</Button>
		{#if periodObj.unit === Period.Month}
			{format(periodObj.dates.start, 'LLL yyyy')}
		{:else if periodObj.unit === Period.Day}
			{format(periodObj.dates.start, 'yyyy-MM-dd')}
		{/if}
		<Button
			href={urlBase(stringifyComposedPeriod(getNextComposedPeriod(periodObj)))}
			data-sveltekit-preload-data="hover">
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
	<div>
		<Button
			href={urlBase(stringifyComposedPeriod(getTodayComposedPeriod()))}
			data-sveltekit-preload-data="hover">
			<Label>today</Label>
		</Button>
		<Button
			href={urlBase(stringifyComposedPeriod(getThisMonthComposedPeriod()))}
			data-sveltekit-preload-data="hover">
			<Label>this month</Label>
		</Button>
		<Group variant="outlined">
			<Button
				href={urlBase(stringifyComposedPeriod(changeComposedPeriodUnit(periodObj, Period.Month)))}
				color="secondary"
				disabled={periodObj.unit === Period.Month}
				data-sveltekit-preload-data="hover">
				<Label>Monthly</Label>
			</Button>
			<Button
				href={urlBase(stringifyComposedPeriod(changeComposedPeriodUnit(periodObj, Period.Day)))}
				color="secondary"
				disabled={periodObj.unit === Period.Day}
				data-sveltekit-preload-data="hover">
				<Label>Daily</Label>
			</Button>
		</Group>
	</div>
</div>

<style>
	.controls-container {
		display: flex;
		flex-direction: column;
	}
	.oneLiner {
		flex-direction: row;
	}

	.controlSpace {
		width: 100%;
		justify-content: space-between;
	}
</style>
