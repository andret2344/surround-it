import {getActiveBracketPairs, isActive} from './service/StorageService';
import {BracketPair} from './entity/BracketPair';

export function isEventCorrect(e: InputEvent): boolean {
	return !e.isComposing
		&& !!e.target
		&& e.inputType === 'insertText'
		&& typeof e.data === 'string'
		&& e.data.length === 1;
}

export function isBackspaceEvent(e: InputEvent): boolean {
	return !e.isComposing
		&& !!e.target
		&& e.inputType === 'deleteContentBackward';
}

export function isTextBox(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement {
	if (!target) {
		return false;
	}
	if (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement)) {
		return false;
	}
	if (target instanceof HTMLInputElement && target.type === 'password') {
		return false;
	}
	return !target.readOnly && !target.disabled;
}

// Code editors pair brackets on their own; interfering with their hidden inputs corrupts their state.
const CODE_EDITOR_SELECTOR: string = '.monaco-editor, .cm-editor, .CodeMirror, .ace_editor';

export function isInsideCodeEditor(element: Element): boolean {
	return element.closest(CODE_EDITOR_SELECTOR) !== null;
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

export function getPairAround(prevChar: string, nextChar: string): BracketPair | null {
	if (!prevChar || !nextChar) {
		return null;
	}
	if (!isActive()) {
		return null;
	}
	return getActiveBracketPairs().find((p: BracketPair): boolean => p.l === prevChar && p.r === nextChar) || null;
}
