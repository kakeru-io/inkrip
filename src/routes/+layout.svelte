<script lang="ts">
	import '../app.css';
</script>

<div class="max-w-[1440px] boxx">
	<slot />
</div>

<svelte:head>

	<!-- タイトルは英語ベース -->
	<title>inkrip - Amazon Receipt Name Insertion Service / アマゾン領収書に宛名を印字</title>

	<!-- メタタグ: 多言語対応 (日本語 & 英語) -->
	<meta
		name="description"
		content="inkrip is a service for adding your name to Amazon receipts (PDF). 現在はアマゾン領収書にのみ対応し、宛名を簡単に印字できます。"
	/>

	<!-- キーワード (日英混在) -->
	<meta
		name="keywords"
		content="Amazon receipt, name insertion, PDF editing, inkrip, Amazon領収書, 宛名, 領収書印字サービス"
	/>

	<!-- OGP英語/日本語混在 -->
	<meta property="og:title" content="inkrip - Amazon Receipt Name Insertion / アマゾン領収書宛名印字" />
	<meta
		property="og:description"
		content="inkrip: Insert your name into Amazon receipts. アマゾン領収書に宛名を印字するサービス。"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="" />

	<!-- Twitterカード対応 -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="inkrip: Amazon Receipt Name Insertion / アマゾン領収書宛名" />
	<meta
		name="twitter:description"
		content="Insert your name into Amazon receipts. アマゾン領収書に宛名を印字。"
	/>
	<meta name="twitter:image" content="" />

	<!-- robots設定 -->
	<meta name="robots" content="index, follow" />

	<!-- Fonts -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
	/>

	<!-- Material Typography -->
	<link
		rel="stylesheet"
		href="https://unpkg.com/@material/typography@14.0.0/dist/mdc.typography.css"
	/>

	<!-- SMUI -->
	<link rel="stylesheet" href="https://unpkg.com/svelte-material-ui/bare.css" />

	<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2641215286019570"
					crossorigin="anonymous"></script>
</svelte:head>
