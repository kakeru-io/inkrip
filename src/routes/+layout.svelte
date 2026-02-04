<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import '../app.css';
	import { locale, t } from '$lib/i18n';
	let isMechanismOpen = false;

	function openMechanism(event: Event) {
		event.preventDefault();
		isMechanismOpen = true;
	}

	function closeMechanism() {
		isMechanismOpen = false;
	}

	function toggleLang() {
		locale.set($locale === 'ja' ? 'en' : 'ja');
	}
</script>

<svelte:head>
	<title>inkrip - Amazon Receipt Name Insertion Service / アマゾン領収書に宛名を印字</title>

	<meta
		name="description"
		content="inkrip is a service for adding your name to Amazon receipts (PDF). 現在はアマゾン領収書にのみ対応し、宛名を簡単に印字できます。"
	/>
	<meta
		name="keywords"
		content="Amazon receipt, name insertion, PDF editing, inkrip, Amazon領収書, 宛名, 領収書印字サービス"
	/>

	<meta property="og:title" content="inkrip - Amazon Receipt Name Insertion / アマゾン領収書宛名印字" />
	<meta
		property="og:description"
		content="inkrip: Insert your name into Amazon receipts. アマゾン領収書に宛名を印字するサービス。"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="inkrip: Amazon Receipt Name Insertion / アマゾン領収書宛名" />
	<meta
		name="twitter:description"
		content="Insert your name into Amazon receipts. アマゾン領収書に宛名を印字。"
	/>
	<meta name="twitter:image" content="" />

	<meta name="robots" content="index, follow" />

	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;600&display=swap"
	/>

	<meta name="google-adsense-account" content="ca-pub-2641215286019570" />
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2641215286019570"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="shell">
	<header class="header">
		<div class="brand">
			<a href="/">inkrip</a>
		</div>
		<nav class="header-actions">
			<a href="#mechanism" on:click={openMechanism}>
				{$locale ? $t('ui.mechanism') : 'しくみ'}
			</a>
			<button class="btn-ghost" type="button" on:click={toggleLang}>
				{$locale ? $t('ui.langToggle') : 'EN'}
			</button>
		</nav>
	</header>

	<div id="mechanism"></div>

	<main class="main">
		<slot />
	</main>

	<footer class="footer" id="footer-contact">
		<div class="footer-links">
			<a href="/legal">{$locale ? $t('footer.legal') : '特定商取引法'}</a>
			<a href="/terms">{$locale ? $t('footer.terms') : '利用規約'}</a>
			<a href="/privacy">{$locale ? $t('footer.privacy') : 'プライバシー'}</a>
		</div>
		<div>{$locale ? $t('footer.copyright') : '© 2025 inkrip'}</div>
	</footer>
</div>

{#if isMechanismOpen}
	<div class="modal-backdrop" on:click={closeMechanism}>
		<div class="modal-card" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{$locale ? $t('ui.howItWorks') : 'しくみ'}</h2>
				<button class="btn-ghost" type="button" on:click={closeMechanism}>
					{$locale ? $t('ui.close') : '閉じる'}
				</button>
			</div>
			<div class="modal-body">
				<p class="modal-lead">
					{$locale ? $t('mechanism.summary') : 'ローカルだけで完結する、ページ単位の印字ツールです。'}
				</p>
				<ul class="modal-list">
					<li>
						{$locale
							? $t('mechanism.list1')
							: 'PDF は端末内で処理され、サーバーへ送信されません。'}
					</li>
					<li>
						{$locale
							? $t('mechanism.list2')
							: 'プレビュー上で位置調整し、そのページだけに反映します。'}
					</li>
					<li>
						{$locale ? $t('mechanism.list3') : '書き出しもブラウザ内で完了します。'}
					</li>
				</ul>
				<p class="modal-note">
					{$locale
						? $t('mechanism.note')
						: 'プライバシーに配慮しながら、ページ単位で調整できます。'}
				</p>
			</div>
		</div>
	</div>
{/if}
