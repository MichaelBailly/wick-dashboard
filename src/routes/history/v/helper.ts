import { FEE_PER_TRADE } from '$lib/constants.client';
import type { TradeRecordClient } from '$lib/types/TradeRecordClient';
import { getFamilyLabel, getVolumeFamily } from '$lib/volumeReference';

export type PnlPerTypePerVolumeFamily = {
	volumeFamily: string;
	pnl: number;
	tradeCount: number;
	watcher: {
		type: string;
		config: string;
	};
};

export function computePerTypePerVolumeFamily(
	trades: TradeRecordClient[],
	showNegativePnL: boolean
) {
	let pnlPerTypePerVolumeFamily: PnlPerTypePerVolumeFamily[] = [];
	trades.forEach((t) => {
		const family = getVolumeFamily(t.pair);
		if (!family) return;
		let pptpvf = pnlPerTypePerVolumeFamily.find(
			(p) =>
				p.watcher.type === t.watcher.type &&
				p.watcher.config === t.watcher.config &&
				p.volumeFamily === family
		);
		if (!pptpvf) {
			pptpvf = {
				volumeFamily: family,
				pnl: 0,
				tradeCount: 0,
				watcher: { ...t.watcher }
			};
			pnlPerTypePerVolumeFamily.push(pptpvf);
		}
		pptpvf.pnl += t.pnl - FEE_PER_TRADE;
		pptpvf.tradeCount += 1;
	});
	pnlPerTypePerVolumeFamily = pnlPerTypePerVolumeFamily
		.filter((p) => ((showNegativePnL && p.pnl < 0) || p.pnl > 0 ? true : false))
		.map((p) => ({
			...p,
			volumeFamily: getFamilyLabel(p.volumeFamily)
		}));
	pnlPerTypePerVolumeFamily.sort((a, b) => b.pnl - a.pnl);
	return pnlPerTypePerVolumeFamily;
}

type FamilyName = 'xs' | 's' | 'm' | 'l' | 'xl';
export type BestGroup = {
	xs: number;
	s: number;
	m: number;
	l: number;
	xl: number;
	watcher: {
		type: string;
		config: string;
	};
	pnl: number;
	families: string[];
};

export function computeBestGroupPerType(trades: TradeRecordClient[]) {
	let bestGroupPerType: BestGroup[] = [];
	trades.forEach((t) => {
		const family = getVolumeFamily(t.pair);
		if (!family) return;
		if (family !== 'xs' && family !== 's' && family !== 'm' && family !== 'l' && family !== 'xl')
			return;

		let bgt = bestGroupPerType.find(
			(p) => p.watcher.type === t.watcher.type && p.watcher.config === t.watcher.config
		);
		if (!bgt) {
			bgt = {
				xs: 0,
				s: 0,
				m: 0,
				l: 0,
				xl: 0,
				pnl: 0,
				families: [],
				watcher: { ...t.watcher }
			};
			bestGroupPerType.push(bgt);
		}
		bgt[family] += t.pnl - FEE_PER_TRADE;
	});
	for (const b of bestGroupPerType) {
		for (const f of ['xs', 's', 'm', 'l', 'xl']) {
			const fname = f as FamilyName;
			if (b[fname] > 0) {
				b.pnl += b[fname];
				b.families.push(f);
			}
		}
	}
	bestGroupPerType = bestGroupPerType
		.filter((best) => best.pnl > 0)
		.map((best) => ({ ...best, families: best.families.map(getFamilyLabel) }));
	bestGroupPerType.sort((a, b) => b.pnl - a.pnl);

	return bestGroupPerType;
}
