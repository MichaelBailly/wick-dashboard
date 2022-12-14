import { getNetPnl } from '$lib/tradeUtils';
import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
import { FamilyId, getReference, getVolumeFamily, loadReference } from '$lib/volumeReference';
import { getVolumeReference } from './db/references';

export async function ensureReferencesAreLoaded() {
	const reference = getReference();
	if (!reference.length) {
		const dbRefs = await getVolumeReference();
		loadReference(dbRefs);
	}
}

export function toDashboardTrade(trade: TradeRecordClient): DashboardTrade {
	const { details, ...result } = trade;

	return {
		...result,
		volumeFamily: trade.volumeFamily || getVolumeFamily(trade.pair),
		cmcFamily: trade.cmcFamily || FamilyId.unknown,
		netPnl: getNetPnl(trade)
	};
}
