// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// optimizeDeps や alias の設定は一旦削除またはコメントアウト
	// optimizeDeps: { ... },
	// resolve: { alias: { ... } },
});