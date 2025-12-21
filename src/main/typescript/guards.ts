import {getActiveBracketPairs, isActive} from './service/StorageService';
import {BracketPair} from './entity/BracketPair';

export function isEventCorrect(e: InputEvent): boolean {
	return !e.isComposing
		&& !!e.target
		&& e.inputType === 'insertText'
		&& typeof e.data === 'string'
		&& e.data.length === 1;
}

export function isTextBox(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement {
	if (!target) {
		return false;
	}
	if (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement)) {
		return false;
	}
	return !target.readOnly && !target.disabled;
}

export function getProcessedBracketPair(bracket: string | null): BracketPair | null {
	if (!bracket) {
		return null;
	}
	if (!isActive()) {
		return null;
	}
	return getActiveBracketPairs().find((p: BracketPair): boolean => p.l === bracket || p.r === bracket) || null;
}
