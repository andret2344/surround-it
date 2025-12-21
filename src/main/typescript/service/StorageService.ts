import browser, {Storage} from 'webextension-polyfill';
import {BracketPair} from '../entity/BracketPair';
import StorageChange = Storage.StorageChange;

//////////////////////
//      ACTIVE      //
//////////////////////

let featureActive: boolean = true;

initActive().then();

function isActive(): boolean {
	return featureActive;
}

async function loadActive(): Promise<boolean> {
	const record: Record<string, unknown> = await browser.storage.local.get('active');
	return record['active'] as boolean ?? false;
}

async function initActive(): Promise<void> {
	featureActive = await loadActive();
}

browser.storage.onChanged.addListener((changes: Record<string, StorageChange>, area: string): void => {
	if (area === 'local' && changes.active) {
		featureActive = changes.active.newValue !== false;
	}
});

function setActive(active: boolean, callback: (() => void) | undefined = undefined): void {
	featureActive = active;
	browser.storage.local.set({active}).then(callback);
}

//////////////////////
//     BRACKETS     //
//////////////////////

let brackets: BracketPair[] = [];

initBrackets().then();

function getActiveBracketPairs(): BracketPair[] {
	return brackets.filter((p: BracketPair): boolean => p.activeInsert || p.activeSurround);
}

function getDefaultBracketPairs(): BracketPair[] {
	return [
		{l: '(', r: ')', activeInsert: true, activeSurround: true},
		{l: '{', r: '}', activeInsert: true, activeSurround: true},
		{l: '<', r: '>', activeInsert: true, activeSurround: true},
		{l: '[', r: ']', activeInsert: true, activeSurround: true},
		{l: '\'', r: '\'', activeInsert: true, activeSurround: true},
		{l: '"', r: '"', activeInsert: true, activeSurround: true},
		{l: '`', r: '`', activeInsert: true, activeSurround: true},
		{l: '_', r: '_', activeInsert: false, activeSurround: true},
		{l: '*', r: '*', activeInsert: false, activeSurround: true},
		{l: '~', r: '~', activeInsert: false, activeSurround: true},
		{l: '/', r: '/', activeInsert: false, activeSurround: true},
		{l: '\\', r: '\\', activeInsert: false, activeSurround: true},
		{l: '|', r: '|', activeInsert: false, activeSurround: true},
		{l: '#', r: '#', activeInsert: false, activeSurround: false},
		{l: '$', r: '$', activeInsert: false, activeSurround: false},
		{l: '%', r: '%', activeInsert: false, activeSurround: false}
	];
}

async function saveBracketPairs(bracketPairs: BracketPair[]): Promise<void> {
	return await browser.storage.local.set({bracketPairs});
}

async function loadBracketPairs(): Promise<BracketPair[]> {
	const value: Record<string, any> = await browser.storage.local.get('bracketPairs');
	return value['bracketPairs'] ?? getDefaultBracketPairs();
}

async function initBrackets(): Promise<void> {
	brackets = await loadBracketPairs();
}

browser.storage.onChanged.addListener((changes: Record<string, StorageChange>, area: string): void => {
	if (area !== 'local') {
		return;
	}
	if (changes.bracketPairs) {
		const newValue: BracketPair[] = changes.bracketPairs.newValue as BracketPair[];
		brackets = newValue ?? getDefaultBracketPairs();
	}
	if (changes.active) {
		featureActive = changes.active.newValue as boolean;
	}
});

//////////////////////
//  COLUMN SETTINGS  //
//////////////////////

interface ColumnSettings {
	insertEnabled: boolean;
	surroundEnabled: boolean;
}

let columnSettings: ColumnSettings = {insertEnabled: true, surroundEnabled: true};

initColumnSettings().then();

async function loadColumnSettings(): Promise<ColumnSettings> {
	const record: Record<string, unknown> = await browser.storage.local.get('columnSettings');
	return record['columnSettings'] as ColumnSettings ?? {insertEnabled: true, surroundEnabled: true};
}

async function saveColumnSettings(settings: ColumnSettings): Promise<void> {
	columnSettings = settings;
	return await browser.storage.local.set({columnSettings: settings});
}

async function initColumnSettings(): Promise<void> {
	columnSettings = await loadColumnSettings();
}

function getColumnSettings(): ColumnSettings {
	return columnSettings;
}

browser.storage.onChanged.addListener((changes: Record<string, StorageChange>, area: string): void => {
	if (area === 'local' && changes.columnSettings) {
		columnSettings = changes.columnSettings.newValue as ColumnSettings ?? {insertEnabled: true, surroundEnabled: true};
	}
});

export {
	isActive,
	setActive,
	loadActive,
	saveBracketPairs,
	getActiveBracketPairs,
	loadBracketPairs,
	loadColumnSettings,
	saveColumnSettings,
	getColumnSettings
};
