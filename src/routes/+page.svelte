<script context="module">
	// SSRは無効化（クライアント完結ツール）
	export const ssr = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { PDFDocument } from 'pdf-lib';
	import saveAs from 'file-saver';
	import fontkit from '@pdf-lib/fontkit';

	/* ===============================
		 設定
	=============================== */
	const fontPath = '/fonts/NotoSansJP-Regular.ttf';

	/* ===============================
		 状態
	=============================== */
	let isReady = false;
	let fontBytes: Uint8Array | null = null;
	let isJapaneseFontReady = false;
	let pdfBytes: Uint8Array | null = null;

	export let address = '株式会社○○ 御中';

	/* ===============================
		 初期化
	=============================== */
	async function initialize() {
		try {
			const res = await fetch(fontPath);
			if (res.ok) {
				fontBytes = new Uint8Array(await res.arrayBuffer());
				isJapaneseFontReady = true;
			}
		} catch (e) {
			console.warn('日本語フォントの読み込みに失敗しました');
		} finally {
			isReady = true;
		}
	}

	onMount(initialize);

	/* ===============================
		 PDF処理
	=============================== */
	async function handleFileUpload(e) {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			pdfBytes = new Uint8Array(reader.result as ArrayBuffer);
		};
		reader.readAsArrayBuffer(file);
	}

	async function exportPDF() {
		if (!pdfBytes) {
			alert('PDFをアップロードしてください');
			return;
		}

		try {
			const pdfDoc = await PDFDocument.load(pdfBytes);
			pdfDoc.registerFontkit(fontkit);

			let font;
			if (fontBytes && isJapaneseFontReady) {
				font = await pdfDoc.embedFont(fontBytes);
			} else {
				if (/[一-龯ぁ-んァ-ン]/.test(address)) {
					alert('日本語フォントが利用できません');
					return;
				}
				font = await pdfDoc.embedFont('Helvetica');
			}

			const [page] = pdfDoc.getPages();
			const pageHeight = page.getHeight();

			const fontSize = 8;
			const textWidth = font.widthOfTextAtSize(address, fontSize);

			const scale = 1.5;
			const fieldX = 664;
			const fieldY = 95;
			const fieldW = 150;
			const fieldH = 40;

			const x = fieldX / scale + fieldW / scale - textWidth;
			const y = pageHeight - fieldY / scale - fieldH / scale;

			page.drawText(address, { x, y, size: fontSize, font });

			const out = await pdfDoc.save();
			saveAs(new Blob([out], { type: 'application/pdf' }), `${address}_receipt.pdf`);
		} catch (e) {
			alert('PDF処理中にエラーが発生しました');
		}
	}
</script>

<svelte:head>
	<title>inkrip | 領収書PDFに宛名を印字する無料ツール</title>
	<meta
		name="description"
		content="inkripは、Amazonの領収書PDFに宛名を簡単に印字できる無料ツールです。ブラウザ完結・ファイル送信なしで安全に利用できます。"
	/>
</svelte:head>

<!-- ========================================================= -->
<!-- HERO / 概要 -->
<!-- ========================================================= -->
<section class="max-w-3xl mx-auto text-center mt-20 mb-16 px-4">
	<h1 class="text-3xl md:text-4xl font-bold mb-6">
		領収書PDFに、さくっと宛名を印字。
	</h1>
	<p class="text-gray-700 leading-relaxed">
		inkip は、<strong>Amazonの領収書PDF</strong>に対して、
		会社名や個人名を右上へ自動印字できる
		<strong>完全無料・ブラウザ完結型ツール</strong>です。
	</p>
</section>

<!-- ========================================================= -->
<!-- 説明コンテンツ -->
<!-- ========================================================= -->
<section class="max-w-3xl mx-auto mb-20 px-4 space-y-10">
	<div>
		<h2 class="text-xl font-bold mb-2">このツールでできること</h2>
		<ul class="list-disc pl-5 text-gray-700 space-y-1">
			<li>Amazonの定型領収書PDFに宛名を印字</li>
			<li>日本語対応（Noto Sans JP 使用）</li>
			<li>ブラウザ内処理（PDFは外部送信されません）</li>
			<li>インストール不要・完全無料</li>
		</ul>
	</div>

	<div>
		<h2 class="text-xl font-bold mb-2">使い方</h2>
		<ol class="list-decimal pl-5 text-gray-700 space-y-1">
			<li>Amazonから領収書PDFをダウンロード</li>
			<li>PDFをアップロード</li>
			<li>宛名を入力してダウンロード</li>
		</ol>
	</div>

	<div>
		<h2 class="text-xl font-bold mb-2">安全性について</h2>
		<p class="text-gray-700">
			このツールは <strong>すべての処理をお使いの端末内で完結</strong> します。
			PDFファイルがサーバーへ送信されることはありません。
		</p>
	</div>
</section>

<!-- ========================================================= -->
<!-- ツール本体 -->
<!-- ========================================================= -->
<section class="max-w-3xl mx-auto mb-32 px-4 space-y-8">
	<div class="p-6 border rounded-lg bg-white">
		<h2 class="font-bold mb-4">1. 領収書PDFをアップロード</h2>
		<input type="file" accept="application/pdf" on:change={handleFileUpload} />
	</div>

	<div class="p-6 border rounded-lg bg-white">
		<h2 class="font-bold mb-4">2. 宛名を入力</h2>
		<input
			type="text"
			bind:value={address}
			class="w-full border px-3 py-2 rounded"
			placeholder="株式会社○○ 御中"
		/>
		<p class="text-xs text-gray-500 mt-2">
			{#if isJapaneseFontReady}
				日本語の印字に対応しています。
			{:else}
				日本語フォントが利用できません。
			{/if}
		</p>
	</div>

	<div class="p-6 border rounded-lg bg-white">
		<h2 class="font-bold mb-4">3. ダウンロード</h2>
		<button
			on:click={exportPDF}
			disabled={!pdfBytes || !isReady}
			class="w-full py-3 bg-gray-800 text-white rounded disabled:bg-gray-400"
		>
			PDFを生成してダウンロード
		</button>
	</div>
</section>
