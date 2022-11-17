import { getDateAtMidnightUTC } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTrades } from '$lib/server/db/trades';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import { format, startOfMonth, sub } from 'date-fns';

type GetResponseBody = {
	watcher: { type: string; config: string };
	netPnl: number;
	positiveNetPnls: Array<{
		volumeFamilyId: string;
		netPnl: number;
		details: { month: string; netPnl: number }[];
	}>;
};

class SFMY {
	type: string;
	config: string;
	family: string;
	netPnl: number;
	pnl: {
		month: string;
		netPnl: number;
	}[];

	constructor(type: string, config: string, family: string) {
		this.type = type;
		this.config = config;
		this.family = family;
		this.netPnl = 0;
		this.pnl = [];
	}

	addPnl(trade: DashboardTrade) {
		const monthYear = format(trade.boughtTimestamp, 'yyyy-MM');
		const pnl = this.pnl.find((pnl) => pnl.month === monthYear);
		if (pnl) {
			pnl.netPnl += trade.netPnl;
		} else {
			this.pnl.push({ month: monthYear, netPnl: trade.pnl });
		}
		this.netPnl += trade.netPnl;
	}

	isValid(months: number) {
		return this.pnl.length === months && this.pnl.every((pnl) => pnl.netPnl > 0);
	}

	toObj() {
		return {
			volumeFamilyId: this.family,
			netPnl: this.netPnl,
			details: [...this.pnl]
		};
	}
}

class SMFYCollection {
	collection: { [key: string]: SFMY } = {};
	addPnl(trade: DashboardTrade) {
		const key = `${trade.watcher.type}-${trade.watcher.config}-${trade.volumeFamily}`;
		let sfmy = this.collection[key];
		if (!sfmy) {
			sfmy = new SFMY(trade.watcher.type, trade.watcher.config, trade.volumeFamily);
			this.collection[key] = sfmy;
		}
		sfmy.addPnl(trade);
	}

	getValidPerStrategy(months: number) {
		const perStrategyHash: {
			[key: string]: GetResponseBody;
		} = {};
		for (const kv of Object.entries(this.collection)) {
			const sfmy = kv[1];
			if (!sfmy.isValid(months)) {
				continue;
			}
			const key = `${sfmy.type}-${sfmy.config}`;
			if (!perStrategyHash[key]) {
				perStrategyHash[key] = {
					watcher: {
						config: sfmy.config,
						type: sfmy.type
					},
					netPnl: 0,
					positiveNetPnls: []
				};
			}
			const obj = sfmy.toObj();
			perStrategyHash[key].positiveNetPnls.push(obj);
			perStrategyHash[key].netPnl += obj.netPnl;
		}
		const result = Object.entries(perStrategyHash).map((kv) => kv[1]);
		result.sort((a, b) => b.netPnl - a.netPnl);
		return result;
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	const monthsAgo = parseInt(url.searchParams.get('months') || '2', 10);

	await ensureReferencesAreLoaded();

	const startMonth = sub(new Date(), { months: monthsAgo - 1 });
	const start = getDateAtMidnightUTC(startOfMonth(startMonth));
	const trades = await getTrades({ start });

	const collection = new SMFYCollection();

	for (const trade of trades) {
		collection.addPnl(toDashboardTrade(trade));
	}

	const response = collection.getValidPerStrategy(monthsAgo);
	return new Response(JSON.stringify(response));
}
