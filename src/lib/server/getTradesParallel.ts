import { getTrades, type TradeHistoryOpts } from './db/trades';

export async function getTradesParallel(
	start: Date,
	end: Date,
	split: number,
	baseArgs: TradeHistoryOpts = {}
) {
	const diff = end.getTime() - start.getTime();
	const increment = Math.round(diff / split);

	const opts = [];
	for (let i = 0; i < split; i++) {
		const startInterval = new Date(end.getTime() - increment * (i + 1));
		const endInterval = new Date(end.getTime() - increment * i);
		opts.push(getTrades({ ...baseArgs, start: startInterval, end: endInterval }));
	}

	const promiseResponse = await Promise.all(opts);
	const trades = promiseResponse.reduce((acc, v) => acc.concat(v), []);
	return trades;
}
