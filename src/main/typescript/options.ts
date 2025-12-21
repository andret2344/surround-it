import '../scss/options.scss';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import {BracketPair} from './entity/BracketPair';
import {loadBracketPairs, saveBracketPairs, loadColumnSettings, saveColumnSettings} from './service/StorageService';
import browser from 'webextension-polyfill';

const tbodyElement: HTMLElement = document.getElementById('tbody') as HTMLElement;
const currentBrackets: BracketPair[] = [];

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

document.querySelector('.add-submit')?.addEventListener('click', (): void => {
	const addLElement: HTMLInputElement | null = document.querySelector('.add-l') as HTMLInputElement;
	const addRElement: HTMLInputElement | null = document.querySelector('.add-r') as HTMLInputElement;
	const bracketL: string = addLElement.value;
	const bracketR: string = addRElement.value;
	if (!bracketL) {
		addLElement.setCustomValidity('Cannot be empty!');
		addLElement.reportValidity();
		return;
	}
	if (!bracketR) {
		addRElement.setCustomValidity('Cannot be empty!');
		addRElement.reportValidity();
		return;
	}
	const foundL = currentBrackets.find(value => value.l === bracketL);
	if (foundL) {
		addLElement.setCustomValidity('Such a left bracket is already defined!');
		addLElement.reportValidity();
		return;
	}

	const bracketPair: BracketPair = {
		l: bracketL,
		r: bracketR,
		activeInsert: true,
		activeSurround: true
	};
	addElement(bracketPair, currentBrackets.length);
	saveBracketPairs(currentBrackets).then((): void => {
		addLElement.value = '';
		addRElement.value = '';
		document.querySelector('.add-result')?.firstChild?.remove();
	});
});

function restoreOptions(): void {
	loadBracketPairs().then((bracketPairs: BracketPair[]): void => bracketPairs.forEach(addElement));
	loadColumnSettings().then((settings): void => {
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
	});
}

function addElement(bracketPair: BracketPair, index: number): void {
	currentBrackets.push(bracketPair);
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
            	<label for='active-insert-${index}' style='display: none;'>${escapedL}${escapedR}</label>
            	<input 
            			id='active-insert-${index}'
            			type='checkbox'
            			data-bracket='${escapedL}'
            			class='bracket-active-insert'
						${(bracketPair.activeInsert ?? false) && 'checked'}
				/>
			</td>
			<td class='text-center'>
				<label for='active-surround-${index}' style='display: none;'>${escapedL}${escapedR}</label>
            	<input 
            			id='active-surround-${index}'
            			type='checkbox'
            			data-bracket='${escapedL}'
            			class='bracket-active-surround'
						${(bracketPair.activeSurround ?? false) && 'checked'}
				/>
            </td>
            <td class='text-center'>
            	<span class='icon-container' data-bracket='${escapedL}'><i class='fa-solid fa-trash'></i></span>
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
