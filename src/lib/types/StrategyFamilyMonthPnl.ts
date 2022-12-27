export type StrategyFamilyMonthPnl = {
	type: string;
	config: string;
	family: string;
	netPnl: number;
};

export function isStrategyFamilyMonthPnl(obj: unknown): obj is StrategyFamilyMonthPnl {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof (obj as StrategyFamilyMonthPnl).type === 'string' &&
		typeof (obj as StrategyFamilyMonthPnl).config === 'string' &&
		typeof (obj as StrategyFamilyMonthPnl).family === 'string' &&
		typeof (obj as StrategyFamilyMonthPnl).netPnl === 'number'
	);
}
