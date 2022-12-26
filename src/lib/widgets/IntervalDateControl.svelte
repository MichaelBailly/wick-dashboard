<script lang="ts">
	import { page } from '$app/stores';
	import { Period } from '$lib/types/Period';

	import Button, { Group, Icon, Label } from '@smui/button';
	import { format } from 'date-fns';
	import {
		changeComposedPeriodUnit,
		getNextComposedPeriod,
		getPreviousComposedPeriod,
		getThisMonthComposedPeriod,
		getTodayComposedPeriod,
		parseComposedPeriod,
		stringifyComposedPeriod,
		type ComposedPeriod
	} from '../../routes/history/t/[type]/[config]/helpers';

	export let periodObj: ComposedPeriod = getThisMonthComposedPeriod();
	export let url: URL;

	const tag = '__REPLACEMENT__';

	let urlBase: Function = (str: string) => {
		return str;
	};

	$: {
		const urlCopy = new URL(url);
		urlCopy.searchParams.set('period', tag);
		const urlStr = urlCopy.toString();
		urlBase = (str: string) => {
			return urlStr.replace(tag, str);
		};
	}

	$: {
		const today = new Date();

		periodObj = getThisMonthComposedPeriod();
		const urlPeriod = $page.url.searchParams.get('period');
		if (urlPeriod) {
			const composed = parseComposedPeriod(urlPeriod);
			if (composed) {
				periodObj = composed;
			}
		}
	}
</script>

<h4>
	<div>
		<Button href={urlBase(stringifyComposedPeriod(getPreviousComposedPeriod(periodObj)))}>
			<Icon class="material-icons">chevron_left</Icon>
		</Button>
		{#if periodObj.unit === Period.Month}
			{format(periodObj.dates.start, 'LLL yyyy')}
		{:else if periodObj.unit === Period.Day}
			{format(periodObj.dates.start, 'yyyy-MM-dd')}
		{/if}
		<Button href={urlBase(stringifyComposedPeriod(getNextComposedPeriod(periodObj)))}>
			<Icon class="material-icons">chevron_right</Icon>
		</Button>
	</div>
	<div>
		<Button href={urlBase(stringifyComposedPeriod(getTodayComposedPeriod()))}>
			<Label>today</Label>
		</Button>
		<Button href={urlBase(stringifyComposedPeriod(getThisMonthComposedPeriod()))}>
			<Label>this month</Label>
		</Button>
		<Group variant="outlined">
			<Button
				href={urlBase(stringifyComposedPeriod(changeComposedPeriodUnit(periodObj, Period.Month)))}
				color="secondary"
				disabled={periodObj.unit === Period.Month}>
				<Label>Monthly</Label>
			</Button>
			<Button
				href={urlBase(stringifyComposedPeriod(changeComposedPeriodUnit(periodObj, Period.Day)))}
				color="secondary"
				disabled={periodObj.unit === Period.Day}>
				<Label>Daily</Label>
			</Button>
		</Group>
	</div>
</h4>
