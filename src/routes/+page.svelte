<script context="module">
	// SSRは無効化を維持
	export const ssr = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { PDFDocument } from 'pdf-lib'; // StandardFontsは日本語対応しないため削除
	import saveAs from 'file-saver';
	import fontkit from '@pdf-lib/fontkit'; // 日本語フォント対応に必須

	// --- 設定 ---
	const fontPath = '/fonts/NotoSansJP-Regular.ttf'; // static/fonts/NotoSansJP-Regular.ttf に配置されている想定

	// --- 状態管理 ---
	let isPdfLibLoaded = false;
	let fontBytes: Uint8Array | null = null;
	let isJapaneseFontReady = false;

	// --- データ ---
	export let address = '株式会社○○ 御中';
	let pdfBytes: Uint8Array | null = null;

	// --- PDF-LIB 初期化関連 ---

	function initializePdfLib() {
		isPdfLibLoaded = false;
		isJapaneseFontReady = false;

		// 1. 日本語フォントロードのPromise
		const fontLoadPromise = fetch(fontPath)
			.then(res => res.ok ? res.arrayBuffer() : Promise.reject(`Font Status: ${res.status}`))
			.then(buffer => {
				fontBytes = new Uint8Array(buffer);
				isJapaneseFontReady = true; // 成功フラグを立てる
				console.log('JP Font loaded successfully.');
			})
			.catch(err => {
				console.error('Could not fetch NotoSansJP font. Japanese characters will not render:', err);
				// 失敗しても Promise は解決する (処理をブロックしない)
				return Promise.resolve();
			})
			.finally(() => {
				// PDF-LIBの準備が整ったらボタンを有効化
				isPdfLibLoaded = true;
				console.log('PDF-LIB initialized. Print buttons enabled.');
			});
	}

	onMount(() => {
		initializePdfLib();
	});


	/**
	 * PDFファイル読み込み
	 */
	async function handleFileUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		if (!isPdfLibLoaded) {
			alert('PDF処理ライブラリの準備ができていません。');
			return;
		}

		const reader = new FileReader();
		reader.onloadend = async () => {
			pdfBytes = new Uint8Array(reader.result as ArrayBuffer);
			console.log('PDF file read complete. Byte length:', pdfBytes?.length);
		};
		reader.readAsArrayBuffer(file);
	}

	/**
	 * 宛名挿入後のPDFバイトデータを生成 (日本語フォント対応)
	 */
	async function getModifiedPdfBytes() {
		if (!pdfBytes) throw new Error('PDFファイルが選択されていません。');

		const pdfDoc = await PDFDocument.load(pdfBytes);
		pdfDoc.registerFontkit(fontkit);

		let measureFont;

		// 1. 日本語フォントがロードに成功しているかチェック
		if (fontBytes && isJapaneseFontReady) {
			try {
				measureFont = await pdfDoc.embedFont(fontBytes);
				console.log('Using embedded Japanese Font.');
			} catch (err) {
				// フォント埋め込み失敗 (PDF-LIBエラー)
				console.error('Failed to embed JP font:', err);
				throw new Error('日本語フォントの埋め込み処理中にエラーが発生しました。');
			}
		} else {
			// 日本語フォントのロードにそもそも失敗している場合
			if (address.match(/[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/)) {
				// 日本語文字が含まれていると、Helveticaでは WinAnsi エラーになるため、停止させる
				throw new Error('日本語フォントのロードに失敗しているため、日本語文字の印字はできません。');
			}
			// 日本語文字がない場合は、StandardFonts.Helveticaで続行
			measureFont = await pdfDoc.embedFont('Helvetica');
			console.warn('Using Helvetica Font. Japanese characters are not supported.');
		}

		const [page] = pdfDoc.getPages();
		const pageHeight = page.getHeight();

		const fontSize = 8;
		const text = address;

		let scale = 1.5;
		let fieldX = 663.9998474121094;
		let fieldY = 94.90902709960938;
		let fieldW = 150;
		let fieldH = 40;

		// テキスト幅を計算
		const textWidth = measureFont.widthOfTextAtSize(text, fontSize);

		// Right edge => (fieldX/scale + fieldW/scale - textWidth)
		const pdfX = (fieldX / scale) + (fieldW / scale) - textWidth;
		// Bottom-based => (pageHeight - fieldY/scale - fieldH/scale)
		const pdfY = pageHeight - (fieldY / scale) - (fieldH / scale);

		page.drawText(text, {
			x: pdfX,
			y: pdfY,
			size: fontSize,
			font: measureFont
		});

		return await pdfDoc.save();
	}

	/**
	 * Export PDF
	 */
	async function exportPDF() {
		if (!pdfBytes) {
			alert('PDFファイルをアップロードしてください。');
			return;
		}

		try {
			const outBytes = await getModifiedPdfBytes();
			const pdfName = address + '_receipt_inkrip.pdf';
			saveAs(new Blob([outBytes], { type: 'application/pdf' }), pdfName);
			alert('印字が完了しました。ダウンロードを始めます。');
		} catch (e) {
			console.error('PDF生成中にエラーが発生しました:', e);
			alert('PDFの処理中にエラーが発生しました: ' + e.message);
		}
	}

	/* ---------------------------
   お問い合わせフォーム
--------------------------- */
	let contactName = '';
	let contactEmail = '';
	let contactMessage = '';

	/* メール生成（mailto） */
	$: mailtoLink = `mailto:bitboxx.inc@gmail.com?subject=${encodeURIComponent(
		'宛名一括印字・自動印字の相談'
	)}&body=${encodeURIComponent(
		`【お名前】
${contactName}

【メールアドレス】
${contactEmail}

【お問い合わせ内容】
${contactMessage}
`)}`;
</script>

<svelte:head>
	<title>inkrip | 領収書PDFに、さくっと宛名を印字。</title>
</svelte:head>

<div class="max-w-3xl mx-auto text-center mb-10">
	<h1 class="text-3xl font-extrabold text-gray-900 mb-4">
		領収書PDFに、さくっと宛名を印字。
	</h1>
	<p class="text-lg text-red-600 font-bold mb-2">
		⚠️ 現在は、**Amazonの定型領収書**への印字のみ動作確認しています。
	</p>
	<p class="text-gray-600 mb-6">
		**【今後対応予定】** 楽天、その他の汎用PDF領収書にも順次対応予定です。
	</p>
	<div class="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
		**完全無料**でご利用いただけます。
	</div>
</div>

<div class="text-center mb-8">
	<div class="text-xs text-gray-400">[AdSense 広告枠 1: ディスプレイ広告 (高)]</div>
</div>

<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

	<div class="space-y-6">

		<div class="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
			<h2 class="text-xl font-bold mb-4 text-gray-800">1. 領収書PDFをアップロード</h2>

			<label for="pdf-upload" class="flex items-center space-x-3 cursor-pointer">
				<input
					type="file"
					id="pdf-upload"
					accept="application/pdf"
					on:change={handleFileUpload}
					disabled={!isPdfLibLoaded}
					class="hidden"
				/>
				<span
					class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:bg-gray-400">
                ファイルを選択
              </span>
				<span class="text-gray-600">
                {pdfBytes ? `選択されています (${pdfBytes.length} bytes)` : '選択されていません'}
              </span>
			</label>
			<p class="text-xs text-gray-500 mt-2">
				※ PDFファイルのみ対応しています。
			</p>
		</div>

		<div class="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
			<h2 class="text-xl font-bold mb-4 text-gray-800">2. 宛名を入力</h2>
			<input
				type="text"
				bind:value={address}
				placeholder="株式会社○○ 御中"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
			/>
			<p class="text-xs text-gray-500 mt-2">
				{#if isJapaneseFontReady}
					※ 日本語を含め、入力された宛名がAmazon領収書の右上に印字されます。
				{:else}
							<span
								class="text-red-500 font-bold">警告: 日本語フォントのロードに失敗しました。日本語文字の印字はできません。</span>
				{/if}
			</p>
		</div>

		<div class="text-center">
			<div class="text-xs text-gray-400">[AdSense 広告枠 3: インフィード広告 (レクタングル)]</div>
		</div>

		<div class="text-center">
			<div class="text-xs text-gray-400">[AdSense 広告枠 4: ネイティブ広告 (小型)]</div>
		</div>

		<div class="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
			<h2 class="text-xl font-bold mb-4 text-gray-800">3. ダウンロード</h2>
			<button
				on:click={exportPDF}
				disabled={!pdfBytes || !isPdfLibLoaded}
				class="w-full px-4 py-3 bg-gray-800 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-gray-700 transition duration-150 ease-in-out disabled:bg-gray-400"
			>
				PDFを印字・ダウンロード
			</button>
			<p class="text-xs text-gray-500 mt-2">
				※ 処理はデバイス上で行われるため、PDFファイルが外部に送信されることはありません。
			</p>
		</div>

	</div>

	<div class="space-y-6">

		<div
			class="text-center h-48 bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg shadow-md">
			<div class="text-xs text-gray-400">[AdSense 広告枠 2: ディスプレイ広告 (大型)]</div>
		</div>

		<div
			class="text-center h-48 bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg shadow-md">
			<div class="text-xs text-gray-400">[AdSense 広告枠 5: ディスプレイ広告 (中型)]</div>
		</div>

		<div class="p-4 text-sm text-gray-500">
			現在、プレビュー機能は停止中です。印字位置はAmazon領収書の右上に固定されます。
		</div>
	</div>

</div>

<!-- ========================================================= -->
<!-- お問い合わせフォーム（メール起動型） -->
<!-- ========================================================= -->
<section class="max-w-3xl mx-auto mt-20 mb-24 p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
	<h2 class="text-2xl font-bold text-gray-900 mb-4 text-center">
		一括印字・自動印字のご相談はこちら
	</h2>

	<p class="text-gray-600 text-center mb-8">
		一括印字・自動化などの API 化、業務向けカスタマイズ等をご希望の場合、以下のフォームからお問い合わせください。
	</p>

	<div class="space-y-6">

		<!-- 名前 -->
		<div>
			<label class="block text-gray-700 font-semibold mb-1">お名前</label>
			<input
				type="text"
				bind:value={contactName}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
				placeholder="例：山田太郎"
			/>
		</div>

		<!-- メールアドレス -->
		<div>
			<label class="block text-gray-700 font-semibold mb-1">メールアドレス</label>
			<input
				type="email"
				bind:value={contactEmail}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
				placeholder="your@example.com"
			/>
		</div>

		<!-- お問い合わせ内容 -->
		<div>
			<label class="block text-gray-700 font-semibold mb-1">お問い合わせ内容</label>
			<textarea
				bind:value={contactMessage}
				rows="5"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
				placeholder="どのようなご相談でしょうか？（例：月100件の自動印字をしたい など）"
			></textarea>
		</div>

		<!-- メーラー起動ボタン -->
		<div class="text-center mt-6">
			<a
				href={mailtoLink}
				class="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition"
			>
				メールを送信する（メーラーが開きます）
			</a>
		</div>
	</div>
</section>