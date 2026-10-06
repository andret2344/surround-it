import '../scss/popup.scss';
import {loadActive, setActive} from './service/StorageService';
import browser from 'webextension-polyfill';

const powerButton: Element | null = document.querySelector('.power-button');
if (powerButton) {
	loadActive().then((active: boolean): void => {
		let current: boolean = active;
		powerButton.classList.toggle('active', current);

		powerButton.addEventListener('click', (): void => {
			current = !current;
			setActive(current, (): boolean => powerButton.classList.toggle('active', current));
		});
	})
}

const optionsButton: Element | null = document.querySelector('#options-button');
if (optionsButton) {
	optionsButton.textContent = browser.i18n.getMessage('options');
	optionsButton.addEventListener('click', (): Promise<void> => browser.runtime.openOptionsPage());
}
