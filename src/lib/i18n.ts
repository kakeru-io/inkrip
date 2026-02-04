import { getLocaleFromNavigator, init, locale, register, t } from 'svelte-i18n';

let initialized = false;

export function initI18n() {
	if (initialized) return;
	initialized = true;
	register('ja', () => import('./locales/ja.json'));
	register('en', () => import('./locales/en.json'));
	const initial = typeof window === 'undefined' ? 'ja' : getLocaleFromNavigator();
	locale.set(initial);
	init({
		fallbackLocale: 'ja',
		initialLocale: initial
	});
}

initI18n();

export { locale, t };
