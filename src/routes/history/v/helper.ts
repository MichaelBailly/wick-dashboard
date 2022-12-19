import type { DashboardTrade } from '$lib/types/DashboardTrade';
import type { Watcher } from '$lib/types/Watcher';
import { FamilyId, getFamilyLabel } from '$lib/volumeReference';

export type PnlPerTypePerVolumeFamily = {
	volumeFamily: string;
	pnl: number;
	tradeCount: number;
	watcher: Watcher;
};

export function computePerTypePerVolumeFamily(trades: DashboardTrade[]) {
	let pnlPerTypePerVolumeFamily: PnlPerTypePerVolumeFamily[] = [];
	trades.forEach((t) => {
		const family = t.volumeFamily;
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
		pptpvf.pnl += t.netPnl;
		pptpvf.tradeCount += 1;
	});
	pnlPerTypePerVolumeFamily = pnlPerTypePerVolumeFamily.map((p) => ({
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
	watcher: Watcher;
	pnl: number;
	families: string[];
};

export function computeBestGroupPerType(trades: DashboardTrade[]) {
	let bestGroupPerType: BestGroup[] = [];
	trades.forEach((t) => {
		const family = t.volumeFamily;
		if (!family) return;
		if (
			family !== FamilyId.xs &&
			family !== FamilyId.s &&
			family !== FamilyId.m &&
			family !== FamilyId.l &&
			family !== FamilyId.xl
		) {
			return;
		}
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
		bgt[family] += t.netPnl;
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
