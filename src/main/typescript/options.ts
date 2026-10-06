import '../scss/options.scss';
import {BracketPair} from './entity/BracketPair';
import {
	ColumnSettings,
	loadBracketPairs,
	saveBracketPairs,
	loadColumnSettings,
	saveColumnSettings,
	getDefaultBracketPairs,
	getDefaultColumnSettings
} from './service/StorageService';
import browser from 'webextension-polyfill';

// Font Awesome Free 7.1.0 trash icon, https://fontawesome.com/license/free (CC BY 4.0)
const TRASH_ICON: string = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -16 448 528' aria-hidden='true'><path fill='currentColor' d='M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z'/></svg>`;

const tbodyElement: HTMLElement = document.getElementById('tbody') as HTMLElement;
const currentBrackets: BracketPair[] = [];
let rowCounter: number = 0;

insertCustomText();

document.querySelectorAll<HTMLElement>('[data-localizable]').forEach((element: HTMLElement): void => {
	const attribute: string | undefined = element.dataset.localizable;
	if (!attribute) {
		return;
	}
	const message: string = browser.i18n.getMessage(attribute);
	const translationAttr: string | undefined = element.dataset.localizableAttr;
	if (translationAttr) {
		element.setAttribute(translationAttr, message)
	} else {
		element.textContent = message;
	}
});

document.addEventListener('click', (ev: MouseEvent): void => {
	const target: HTMLElement | null = (ev.target as Element).closest<HTMLElement>('.bracket-active-insert, .bracket-active-surround');
	if (!target) {
		return;
	}
	const bracket: string | undefined = target.dataset.bracket;
	const index: number = currentBrackets.findIndex((value: BracketPair): boolean => value.l === bracket);
	if (index !== -1) {
		const isInsert: boolean = target.classList.contains('bracket-active-insert');
		const partialBracketObject: Partial<BracketPair> = isInsert ? {activeInsert: (target as HTMLInputElement).checked} : {activeSurround: (target as HTMLInputElement).checked};
		currentBrackets[index] = {
			...currentBrackets[index],
			...partialBracketObject
		};
		saveBracketPairs(currentBrackets).then();
	}
});

document.addEventListener('click', (ev: MouseEvent): void => {
	const target: HTMLElement | null = (ev.target as Element).closest<HTMLElement>('.icon-container');
	if (!target) {
		return;
	}
	const bracket: string | undefined = target.dataset.bracket;
	const index: number = currentBrackets.findIndex((value: BracketPair): boolean => value.l === bracket);
	if (index !== -1) {
		currentBrackets.splice(index, 1);
		saveBracketPairs(currentBrackets).then();
		target.closest('.bracket-parent')?.remove();
	}
});

document.querySelectorAll('.add-input').forEach((el: Element): void =>
	el.addEventListener('input', (): void => {
		const bracketL: string = (document.querySelector('.add-l') as HTMLInputElement).value;
		const bracketR: string = (document.querySelector('.add-r') as HTMLInputElement).value;
		(el as HTMLInputElement).setCustomValidity('');
		const text: Text = document.createTextNode(`${bracketL}xyz${bracketR}`);
		const addResult: Element | null = document.querySelector('.add-result');
		addResult?.firstChild?.remove();
		addResult?.appendChild(text);
	}));

document.addEventListener('click', (ev: MouseEvent): void => {
	const target: HTMLElement | null = (ev.target as Element).closest<HTMLElement>('.column-toggle');
	if (!target) {
		return;
	}
	const checkbox = target as HTMLInputElement;
	const column: string | undefined = checkbox.dataset.column;
	if (!column) {
		return;
	}

	loadColumnSettings().then((settings): void => {
		if (column === 'insert') {
			settings.insertEnabled = checkbox.checked;
		} else if (column === 'surround') {
			settings.surroundEnabled = checkbox.checked;
		}
		saveColumnSettings(settings).then();
		updateColumnState(column, checkbox.checked);
	});
});

function updateColumnState(column: string, enabled: boolean): void {
	const checkboxes = document.querySelectorAll<HTMLInputElement>(
		column === 'insert' ? '.bracket-active-insert' : '.bracket-active-surround'
	);
	checkboxes.forEach((checkbox: HTMLInputElement): void => {
		checkbox.disabled = !enabled;
	});
}

// A character may belong to one pair only; otherwise typing it would be ambiguous.
function isCharacterUsed(char: string): boolean {
	return currentBrackets.some((value: BracketPair): boolean => value.l === char || value.r === char);
}

document.querySelector('.add-submit')?.addEventListener('click', (): void => {
	const addLElement: HTMLInputElement | null = document.querySelector('.add-l') as HTMLInputElement;
	const addRElement: HTMLInputElement | null = document.querySelector('.add-r') as HTMLInputElement;
	const bracketL: string = addLElement.value;
	const bracketR: string = addRElement.value;
	if (!bracketL) {
		addLElement.setCustomValidity(browser.i18n.getMessage('error_empty'));
		addLElement.reportValidity();
		return;
	}
	if (!bracketR) {
		addRElement.setCustomValidity(browser.i18n.getMessage('error_empty'));
		addRElement.reportValidity();
		return;
	}
	if (isCharacterUsed(bracketL)) {
		addLElement.setCustomValidity(browser.i18n.getMessage('error_collision'));
		addLElement.reportValidity();
		return;
	}
	if (isCharacterUsed(bracketR)) {
		addRElement.setCustomValidity(browser.i18n.getMessage('error_collision'));
		addRElement.reportValidity();
		return;
	}

	const bracketPair: BracketPair = {
		l: bracketL,
		r: bracketR,
		activeInsert: true,
		activeSurround: true
	};
	addElement(bracketPair);
	saveBracketPairs(currentBrackets).then((): void => {
		addLElement.value = '';
		addRElement.value = '';
		document.querySelector('.add-result')?.firstChild?.remove();
	});
});

document.querySelector('.restore-defaults')?.addEventListener('click', (): void => {
	if (!confirm(browser.i18n.getMessage('restore_defaults_confirm'))) {
		return;
	}
	const bracketPairs: BracketPair[] = getDefaultBracketPairs();
	const settings: ColumnSettings = getDefaultColumnSettings();
	Promise.all([saveBracketPairs(bracketPairs), saveColumnSettings(settings)])
		.then((): void => renderOptions(bracketPairs, settings));
});

function restoreOptions(): void {
	Promise.all([loadBracketPairs(), loadColumnSettings()])
		.then(([bracketPairs, settings]): void => renderOptions(bracketPairs, settings));
}

function renderOptions(bracketPairs: BracketPair[], settings: ColumnSettings): void {
	currentBrackets.length = 0;
	tbodyElement.replaceChildren();
	bracketPairs.forEach(addElement);

	const insertCheckbox = document.getElementById('column-insert-enabled') as HTMLInputElement;
	const surroundCheckbox = document.getElementById('column-surround-enabled') as HTMLInputElement;
	if (insertCheckbox) {
		insertCheckbox.checked = settings.insertEnabled;
		updateColumnState('insert', settings.insertEnabled);
	}
	if (surroundCheckbox) {
		surroundCheckbox.checked = settings.surroundEnabled;
		updateColumnState('surround', settings.surroundEnabled);
	}
}

function isColumnEnabled(id: string): boolean {
	return (document.getElementById(id) as HTMLInputElement | null)?.checked ?? true;
}

function addElement(bracketPair: BracketPair): void {
	currentBrackets.push(bracketPair);
	const rowId: number = rowCounter++;
	const escapedL: string = escapeHTML(bracketPair.l);
	const escapedR: string = escapeHTML(bracketPair.r);

	const html = `
        <tr class='bracket-parent'>
            <td>
            	<pre class='text-center'>${escapedL}</pre>
            </td>
            <td>
            	<pre class='text-center'>${escapedR}</pre>
            </td>
            <td>
            	<pre class='text-center'>${escapedL}xyz${escapedR}</pre>
            </td>
            <td class='text-center'>
            	<label for='active-insert-${rowId}' style='display: none;'>${escapedL}${escapedR}</label>
            	<input
            			id='active-insert-${rowId}'
            			type='checkbox'
            			data-bracket='${escapedL}'
            			class='bracket-active-insert'
						${bracketPair.activeInsert ? 'checked' : ''}
						${isColumnEnabled('column-insert-enabled') ? '' : 'disabled'}
				/>
			</td>
			<td class='text-center'>
				<label for='active-surround-${rowId}' style='display: none;'>${escapedL}${escapedR}</label>
            	<input
            			id='active-surround-${rowId}'
            			type='checkbox'
            			data-bracket='${escapedL}'
            			class='bracket-active-surround'
						${bracketPair.activeSurround ? 'checked' : ''}
						${isColumnEnabled('column-surround-enabled') ? '' : 'disabled'}
				/>
            </td>
            <td class='text-center'>
            	<span class='icon-container' data-bracket='${escapedL}'>${TRASH_ICON}</span>
			</td>
        </tr>`;
	tbodyElement.insertAdjacentHTML('beforeend', html);
}

function escapeHTML(str: string): string {
	return str
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#039;');
}

function insertCustomText(): void {
	const span: Element | null = document.querySelector('#span-text-add-heading');
	if (span) {
		const bracketsHtml = `<span class="word-color">${browser.i18n.getMessage('brackets')}</span>`;
		span.innerHTML = browser.i18n.getMessage('type_here', [bracketsHtml]);
	}
}

document.addEventListener('DOMContentLoaded', restoreOptions);
