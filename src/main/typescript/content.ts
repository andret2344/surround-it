import {BracketPair} from './entity/BracketPair';
import {getPairAround, getProcessedBracketPair, isBackspaceEvent, isTextBox, isEventCorrect, isInsideCodeEditor} from './guards';
import {getColumnSettings} from './service/StorageService';

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// Besides whitespace and the end of text, a pair is also inserted right before these characters (like VS Code's autoCloseBefore).
const AUTO_CLOSE_BEFORE: string = ';:.,=}])>';

function isWhitespace(char: string): boolean {
	// '\u00a0': contenteditable turns a typed trailing space into a non-breaking space
	return char === ' ' || char === '\t' || char === '\n' || char === '\u00a0';
}

function isInsertEnabled(pair: BracketPair): boolean {
	return pair.activeInsert && getColumnSettings().insertEnabled;
}

function shouldSkipClosingBracket(eventData: string | null, pair: BracketPair, nextChar: string, isCollapsed: boolean): boolean {
	return eventData === pair.r && isCollapsed && nextChar === pair.r;
}

function shouldAllowInsertion(pair: BracketPair, eventData: string | null, prevChar: string, nextChar: string): boolean {
	if (eventData !== pair.l) {
		return false;
	}
	if (!isInsertEnabled(pair)) {
		return false;
	}
	const isPrevAllowed: boolean = prevChar === '' || isWhitespace(prevChar);
	const isNextAllowed: boolean = nextChar === '' || isWhitespace(nextChar) || AUTO_CLOSE_BEFORE.includes(nextChar);
	return isPrevAllowed && isNextAllowed;
}

function shouldDeleteEmptyPair(prevChar: string, nextChar: string): boolean {
	const pair: BracketPair | null = getPairAround(prevChar, nextChar);
	return pair !== null && isInsertEnabled(pair);
}

// The real target inside an open shadow root; event.target is retargeted to the shadow host.
function getEventTarget(event: InputEvent): EventTarget | null {
	return event.composedPath()[0] ?? event.target;
}

// execCommand keeps the native undo stack and fires the input events editors and frameworks expect.
function insertText(text: string): void {
	document.execCommand('insertText', false, text);
}

function deleteSelection(): void {
	document.execCommand('delete');
}

//////////////////////
// INPUT & TEXTAREA //
//////////////////////

document.addEventListener('beforeinput', (event: InputEvent): void => {
	const isBackspace: boolean = isBackspaceEvent(event);
	if (!isBackspace && !isEventCorrect(event)) {
		return;
	}

	const target: EventTarget | null = getEventTarget(event);
	if (!isTextBox(target) || isInsideCodeEditor(target)) {
		return;
	}

	const selectionStart: number | null = target.selectionStart;
	const selectionEnd: number | null = target.selectionEnd;
	if (selectionStart == null || selectionEnd == null) {
		return;
	}

	const isCollapsed: boolean = selectionStart === selectionEnd;
	const nextChar: string = target.value[selectionStart] || '';
	const prevChar: string = selectionStart > 0 ? target.value[selectionStart - 1] : '';

	// Handle deleting an empty pair with backspace
	if (isBackspace) {
		if (!isCollapsed || !shouldDeleteEmptyPair(prevChar, nextChar)) {
			return;
		}
		event.preventDefault();
		target.setSelectionRange(selectionStart - 1, selectionStart + 1);
		deleteSelection();
		return;
	}

	const pair: BracketPair | null = getProcessedBracketPair(event.data);
	if (!pair) {
		return;
	}

	// Handle closing bracket skip feature
	if (shouldSkipClosingBracket(event.data, pair, nextChar, isCollapsed) && isInsertEnabled(pair)) {
		event.preventDefault();
		target.setSelectionRange(selectionStart + 1, selectionStart + 1);
		return;
	}

	// Handle insertion (no selection)
	if (isCollapsed) {
		if (!shouldAllowInsertion(pair, event.data, prevChar, nextChar)) {
			return;
		}
		event.preventDefault();
		insertPairAtCaretInput(target, pair, selectionStart);
		return;
	}

	// Handle surrounding (with selection)
	if (!pair.activeSurround || !getColumnSettings().surroundEnabled) {
		return;
	}
	event.preventDefault();
	wrapSelectionWithBracketsInput(target, pair, selectionStart, selectionEnd);
});

function insertPairAtCaretInput(element: HTMLInputElement | HTMLTextAreaElement, pair: BracketPair, cursorPosition: number): void {
	insertText(pair.l + pair.r);
	element.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
}

function wrapSelectionWithBracketsInput(element: HTMLInputElement | HTMLTextAreaElement, pair: BracketPair, selectionStart: number, selectionEnd: number): void {
	const selected: string = element.value.substring(selectionStart, selectionEnd);
	insertText(pair.l + selected + pair.r);
	element.setSelectionRange(selectionStart + 1, selectionStart + 1 + selected.length);
}

//////////////////////
// CONTENT EDITABLE //
//////////////////////

document.addEventListener('beforeinput', (event: InputEvent): void => {
	const isBackspace: boolean = isBackspaceEvent(event);
	if (!isBackspace && !isEventCorrect(event)) {
		return;
	}

	const root: HTMLElement | null = getRoot(getEventTarget(event));
	if (!root || isInsideCodeEditor(root)) {
		return;
	}

	const selection: Selection | null = getSelection();
	if (!selection || selection.rangeCount === 0) {
		return;
	}

	const range: Range = selection.getRangeAt(0).cloneRange();
	if (!root.contains(range.commonAncestorContainer)) {
		return;
	}

	// Handle deleting an empty pair with backspace
	if (isBackspace) {
		const container: Node = range.startContainer;
		if (!range.collapsed || !(container instanceof Text) || range.startOffset === 0 || range.startOffset >= container.length) {
			return;
		}
		const prevChar: string = container.data.charAt(range.startOffset - 1);
		const nextChar: string = container.data.charAt(range.startOffset);
		if (!shouldDeleteEmptyPair(prevChar, nextChar)) {
			return;
		}
		event.preventDefault();
		const pairRange: Range = document.createRange();
		pairRange.setStart(container, range.startOffset - 1);
		pairRange.setEnd(container, range.startOffset + 1);
		selection.removeAllRanges();
		selection.addRange(pairRange);
		deleteSelection();
		return;
	}

	const pair: BracketPair | null = getProcessedBracketPair(event.data);
	if (!pair) {
		return;
	}

	// Handle surrounding (with selection)
	if (!range.collapsed) {
		if (!pair.activeSurround || !getColumnSettings().surroundEnabled) {
			return;
		}
		event.preventDefault();
		wrapSelectionForContentEditable(selection, range, pair);
		return;
	}

	const nextChar: string = getCharNextToCaret(selection, range, root, 'forward');

	// Handle closing bracket skip feature
	if (shouldSkipClosingBracket(event.data, pair, nextChar, true) && isInsertEnabled(pair)) {
		event.preventDefault();
		selection.modify('move', 'forward', 'character');
		return;
	}

	// Handle insertion (no selection)
	const prevChar: string = getCharNextToCaret(selection, range, root, 'backward');
	if (!shouldAllowInsertion(pair, event.data, prevChar, nextChar)) {
		return;
	}
	event.preventDefault();
	insertPairAtCaret(selection, pair);
});

// Inside a text node the character is read directly. At a node boundary the selection is extended by one character
// and read back, because the browser knows how <br>, blocks and inline elements around the caret render.
function getCharNextToCaret(selection: Selection, caret: Range, root: HTMLElement, direction: 'backward' | 'forward'): string {
	const container: Node = caret.startContainer;
	if (container instanceof Text) {
		const index: number = direction === 'backward' ? caret.startOffset - 1 : caret.startOffset;
		if (index >= 0 && index < container.length) {
			return container.data.charAt(index);
		}
	}

	selection.modify('extend', direction, 'character');
	const extended: Range = selection.getRangeAt(0);
	const text: string = root.contains(extended.startContainer) && root.contains(extended.endContainer) ? selection.toString() : '';
	selection.removeAllRanges();
	selection.addRange(caret);
	return direction === 'backward' ? text.charAt(text.length - 1) : text.charAt(0);
}

const EDITING_HOST_SELECTOR: string = '[contenteditable]:not([contenteditable="false"])';

function getRoot(target: EventTarget | null): HTMLElement | null {
	if (!target) {
		return null;
	}

	if (target instanceof HTMLElement) {
		if (target.isContentEditable) {
			return target;
		}
		return target.closest(EDITING_HOST_SELECTOR);
	}

	if (target instanceof Node) {
		const element: HTMLElement | null = target.parentElement;
		if (!element) {
			return null;
		}
		if (element.isContentEditable) {
			return element;
		}
		return element.closest(EDITING_HOST_SELECTOR);
	}

	return null;
}

function insertPairAtCaret(selection: Selection, pair: BracketPair): void {
	insertText(pair.l + pair.r);
	selection.modify('move', 'backward', 'character');
}

// Brackets are inserted separately at both ends, so the selected content keeps its formatting.
// Cloned ranges are live and follow the DOM changes made by the insertions.
function wrapSelectionForContentEditable(selection: Selection, range: Range, pair: BracketPair): void {
	const start: Range = range.cloneRange();
	start.collapse(true);
	const end: Range = range.cloneRange();
	end.collapse(false);

	selection.removeAllRanges();
	selection.addRange(end);
	insertText(pair.r);
	selection.modify('move', 'backward', 'character');
	const innerEnd: Range = selection.getRangeAt(0).cloneRange();

	selection.removeAllRanges();
	selection.addRange(start);
	insertText(pair.l);
	const innerStart: Range = selection.getRangeAt(0).cloneRange();

	const inner: Range = document.createRange();
	inner.setStart(innerStart.startContainer, innerStart.startOffset);
	inner.setEnd(innerEnd.endContainer, innerEnd.endOffset);
	selection.removeAllRanges();
	selection.addRange(inner);
}
