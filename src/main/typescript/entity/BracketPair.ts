export interface BracketPair {
	readonly l: string;
	readonly r: string;
	/** @deprecated */
	readonly active?: boolean;
	readonly activeInsert: boolean;
	readonly activeSurround: boolean;
}
