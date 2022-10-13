import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { TypeHistorySummary } from '$lib/types/TypeHistorySummary';

export function getTypeHistorySummaries(trades: DashboardTrade[]): TypeHistorySummary[] {
	const result: TypeHistorySummary[] = [];
	for (const trade of trades) {
		let historySummary = result.find(
			(s) => s.watcher.type === trade.watcher.type && s.watcher.config === trade.watcher.config
		);
		if (!historySummary) {
			historySummary = {
				watcher: { ...trade.watcher },
				netPnl: 0,
				tradeCount: 0,
				volumeFamilies: []
			};
			result.push(historySummary);
		}
		historySummary.netPnl += trade.netPnl;
		historySummary.tradeCount++;
		let volumeFamily = historySummary.volumeFamilies.find(
			(f) => f.volumeFamily === trade.volumeFamily
		);
		if (!volumeFamily) {
			volumeFamily = {
				volumeFamily: trade.volumeFamily,
				netPnl: 0,
				tradeCount: 0
			};
			historySummary.volumeFamilies.push(volumeFamily);
		}
		volumeFamily.netPnl += trade.netPnl;
		volumeFamily.tradeCount++;
	}
	return result;
}
