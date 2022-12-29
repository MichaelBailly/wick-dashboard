import { getGroupsPerType, getPnlPerTypePerVolumeFamily } from '$lib/server/db/history-volume';
import type { Watcher } from '$lib/types/Watcher';
import { getFamilyLabel } from '$lib/volumeReference';

export type PnlPerTypePerVolumeFamily = {
	volumeFamily: string;
	pnl: number;
	tradeCount: number;
	watcher: Watcher;
};

export async function computePerTypePerVolumeFamily({
	start,
	end
}: {
	start: Date;
	end: Date;
}): Promise<PnlPerTypePerVolumeFamily[]> {
	const pptpvf = await getPnlPerTypePerVolumeFamily({ start, end });

	const pnlPerTypePerVolumeFamily = pptpvf.map((p) => ({
		watcher: p.watcher,
		volumeFamily: getFamilyLabel(p.volumeFamily),
		pnl: p.pnl,
		tradeCount: p.tradeCount
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

export async function computeBestGroupPerType({ start, end }: { start: Date; end: Date }) {
	const groupsPerType = await getGroupsPerType({ start, end });
	const bestGroupPerType: BestGroup[] = [];
	for (const gpt of groupsPerType) {
		const bgpt: BestGroup = {
			xs: gpt.xs,
			s: gpt.s,
			m: gpt.m,
			l: gpt.l,
			xl: gpt.xl,
			watcher: gpt.watcher,
			pnl: 0,
			families: []
		};
		for (const family of ['xs', 's', 'm', 'l', 'xl']) {
			const pnl = bgpt[family as FamilyName];
			if (pnl > 0) {
				bgpt.pnl = pnl;
				bgpt.families.push(family);
			}
		}
		bestGroupPerType.push(bgpt);
	}

	const result = bestGroupPerType
		.filter((best) => best.pnl > 0)
		.map((best) => ({ ...best, families: best.families.map(getFamilyLabel) }));
	result.sort((a, b) => b.pnl - a.pnl);

	return result;
}
