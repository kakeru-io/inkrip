// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { createRequire } from 'module';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const intlMessageformat = require.resolve('intl-messageformat/lib/index.js');
const icuMessageformatParser = require.resolve('@formatjs/icu-messageformat-parser/lib/index.js');
const icuSkeletonParser = require.resolve('@formatjs/icu-skeleton-parser/lib/index.js');

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'intl-messageformat': intlMessageformat,
			'@formatjs/icu-messageformat-parser': icuMessageformatParser,
			'@formatjs/icu-skeleton-parser': icuSkeletonParser
		}
	},
});
