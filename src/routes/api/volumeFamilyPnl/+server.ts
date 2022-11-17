import { getDateAtMidnightUTC } from '$lib/dates';
import { ensureReferencesAreLoaded, toDashboardTrade } from '$lib/server/dashboardTradeConverter';
import { getTrades } from '$lib/server/db/trades';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { FamilyId } from '$lib/volumeReference';
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

/** @type {import('./$types').RequestHandler} */
export async function oldGET({ url }: { url: URL }) {
	const monthsAgo = parseInt(url.searchParams.get('months') || '2', 10);

	await ensureReferencesAreLoaded();

	const startMonth = sub(new Date(), { months: monthsAgo - 1 });
	const start = getDateAtMidnightUTC(startOfMonth(startMonth));

	const trades = (await getTrades({ start })).map(toDashboardTrade);

	const watcherTypes: Map<
		string,
		{ watcher: { type: string; config: string }; trades: DashboardTrade[] }
	> = splitByWatcher(trades);

	const result = [];

	for (const watcherType of watcherTypes.values()) {
		const pnls = getPositivePnl(watcherType.trades, monthsAgo);
		if (pnls.length > 0) {
			result.push({ watcher: watcherType.watcher, positiveNetPnls: pnls });
		}
	}

	result.sort((a, b) => {
		const pnl1 = a.positiveNetPnls.reduce((acc, p) => acc + p.netPnl, 0);
		const pnl2 = b.positiveNetPnls.reduce((acc, p) => acc + p.netPnl, 0);
		return pnl2 - pnl1;
	});

	return new Response(JSON.stringify(result));
}
// ---------------------------------------------------------

function getPositivePnl(trades: DashboardTrade[], monthsAgo = 2) {
	const tradesPerMonth = new Map<string, DashboardTrade[]>();
	for (const trade of trades) {
		const month = format(trade.buyTimestamp, 'yyyy-MM');
		let dashboardTrades = tradesPerMonth.get(month);
		if (!dashboardTrades) {
			dashboardTrades = [];
			tradesPerMonth.set(month, dashboardTrades);
		}
		dashboardTrades.push(trade);
	}

	if (tradesPerMonth.size < monthsAgo) {
		return [];
	}

	const pnlPerMonth: PerMonthPnl[] = [];
	for (const [month, trades] of tradesPerMonth.entries()) {
		const pnl = getPositivePnlPerVolFamily(trades);
		pnlPerMonth.push({ month, pnls: pnl });
	}

	if (pnlPerMonth.length < 2) {
		return [];
	}

	const reference = pnlPerMonth.shift();
	if (!reference) {
		return [];
	}

	const familyOk: Array<{
		volumeFamilyId: string;
		netPnl: number;
		details: { month: string; familyId: string; netPnl: number }[];
	}> = [];

	for (const familyId of Object.keys(reference.pnls)) {
		if (pnlPerMonth.every((p) => p.pnls[familyId] && p.pnls[familyId] > 0)) {
			familyOk.push({
				volumeFamilyId: familyId,
				netPnl:
					reference.pnls[familyId] + pnlPerMonth.reduce((acc, p) => acc + p.pnls[familyId], 0),
				details: getDetails([reference, ...pnlPerMonth], familyId)
			});
		}
	}
	return familyOk;
}

function getDetails(pnlPerMonth: PerMonthPnl[], familyId: string) {
	const details = [];
	const months = new Set<string>();
	for (const pnl of pnlPerMonth) {
		months.add(pnl.month);
	}
	for (const month of [...months]) {
		const pnl = pnlPerMonth
			.filter((p) => p.month === month)
			.reduce((acc, p) => acc + p.pnls[familyId], 0);
		details.push({ month, familyId, netPnl: pnl });
	}
	return details;
}

function getPositivePnlPerVolFamily(trades: DashboardTrade[]): Record<FamilyId, number> {
	const pnlPerVolFamily: PnlPerVolumeFamily = new Map();
	for (const trade of trades) {
		const pnl = trade.netPnl;
		const volFamily = trade.volumeFamily;
		pnlPerVolFamily.set(volFamily, (pnlPerVolFamily.get(volFamily) || 0) + pnl);
	}

	const positivePnlPerVolFamily: Record<string, number> = {};

	for (const [volFamily, pnl] of pnlPerVolFamily.entries()) {
		if (pnl > 0) {
			positivePnlPerVolFamily[volFamily] = pnl;
		}
	}

	return positivePnlPerVolFamily;
}

function splitByWatcher(trades: DashboardTrade[]) {
	const watcherTypes: Map<
		string,
		{ watcher: { type: string; config: string }; trades: DashboardTrade[] }
	> = new Map();
	for (const trade of trades) {
		const type = `${trade.watcher.type} ${trade.watcher.config}`;
		let watcherType = watcherTypes.get(type);

		if (!watcherType) {
			watcherType = { watcher: trade.watcher, trades: [] };
			watcherTypes.set(type, watcherType);
		}
		watcherType.trades.push(trade);
	}
	return watcherTypes;
}

type PnlPerVolumeFamily = Map<FamilyId, number>;

type PerMonthPnl = {
	month: string;
	pnls: Record<string, number>;
};
