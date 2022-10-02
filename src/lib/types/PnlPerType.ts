export type PnlPerType = {
	_id: string;
	pnl: number;
	tradeCount: number;
	watcher: {
		type: string;
		config: string;
	};
};

export function isPnlPerType(obj: unknown): obj is PnlPerType {
	return (
		typeof obj !== null &&
		typeof obj !== undefined &&
		typeof (obj as PnlPerType)._id === 'string' &&
		typeof (obj as PnlPerType).pnl === 'number' &&
		typeof (obj as PnlPerType).tradeCount === 'number' &&
		typeof (obj as PnlPerType).watcher === 'object' &&
		typeof (obj as PnlPerType).watcher.type === 'string' &&
		typeof (obj as PnlPerType).watcher.config === 'string'
	);
}
