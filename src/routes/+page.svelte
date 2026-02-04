<script context="module">
	// SSRは無効化（クライアント完結ツール）
	export const ssr = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { PDFDocument } from 'pdf-lib';
	import saveAs from 'file-saver';
	import fontkit from '@pdf-lib/fontkit';
	import { locale, t } from '$lib/i18n';
	import {
		getDocument,
		GlobalWorkerOptions,
		type PDFPageProxy,
		type PDFDocumentProxy
	} from 'pdfjs-dist/legacy/build/pdf';
	import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker?url';

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
	let pdfPage: PDFPageProxy | null = null;
	let pdfProxy: PDFDocumentProxy | null = null;
	let pdfPageCount = 0;
	let currentPage = 1;
	let pageWidth = 0;
	let pageHeight = 0;
	let previewWidth = 0;
	let previewHeight = 0;
	let previewScale = 1;
	let fileName = '';
	let isRendering = false;
	let renderToken = 0;

	type Stamp = {
		id: string;
		text: string;
		x: number;
		y: number;
		size: number;
	};

	const previewPaddingX = 6;
	const previewPaddingY = 3;

	const defaultStampText = '株式会社○○ 御中';
	let stampsByPage: Record<number, Stamp[]> = {
		1: [{ id: crypto.randomUUID(), text: defaultStampText, x: 0.72, y: 0.16, size: 14 }]
	};
	let activeStampId = stampsByPage[1]?.[0]?.id ?? '';
	let currentStamps: Stamp[] = stampsByPage[1] ?? [];
	let dragTargetId: string | null = null;
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let resizeTargetId: string | null = null;
	let resizeStartX = 0;
	let resizeStartSize = 0;
	let isPointerListening = false;

	let previewContainer: HTMLDivElement | null = null;
	let previewCanvas: HTMLCanvasElement | null = null;
	let overlayLayer: HTMLDivElement | null = null;
	let pageLayer: HTMLDivElement | null = null;
	let resizeObserver: ResizeObserver | null = null;


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

	onMount(() => {
		GlobalWorkerOptions.workerSrc = workerSrc;
		initialize();

		resizeObserver = new ResizeObserver(() => {
			if (pdfPage) {
				void renderPage();
			}
		});

		if (previewContainer) {
			resizeObserver.observe(previewContainer);
		}

		return () => resizeObserver?.disconnect();
	});

	/* ===============================
		 PDF処理
	=============================== */
	async function handleFileUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		fileName = file.name;
		pdfBytes = new Uint8Array(await file.arrayBuffer());
		await loadPdfPreview();
	}

	async function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files?.[0];
		if (!file) return;
		fileName = file.name;
		pdfBytes = new Uint8Array(await file.arrayBuffer());
		await loadPdfPreview();
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	async function loadPdfPreview() {
		if (!pdfBytes) return;
		try {
			const loadingTask = getDocument({ data: pdfBytes.slice() });
			pdfProxy = await loadingTask.promise;
			pdfPageCount = pdfProxy.numPages;
			currentPage = 1;
			ensurePageStamps(currentPage);
			currentStamps = getCurrentStamps();
			pdfPage = await pdfProxy.getPage(currentPage);

			const viewport = pdfPage.getViewport({ scale: 1 });
			pageWidth = viewport.width;
			pageHeight = viewport.height;

			await renderPage();
		} catch (e) {
			console.error('PDF preview error', e);
			alert('PDFのプレビュー読み込みに失敗しました');
		}
	}

	async function goToPage(nextPage: number) {
		if (!pdfBytes || nextPage < 1 || nextPage > pdfPageCount) return;
		currentPage = nextPage;
		dragTargetId = null;
		resizeTargetId = null;
		if (!pdfProxy) {
			const loadingTask = getDocument({ data: pdfBytes.slice() });
			pdfProxy = await loadingTask.promise;
		}
		ensurePageStamps(currentPage);
		pdfPage = await pdfProxy.getPage(currentPage);
		await renderPage();
		currentStamps = getCurrentStamps();
		activeStampId = currentStamps[0]?.id ?? '';
	}

	async function renderPage() {
		if (!pdfPage || !previewCanvas || !previewContainer) return;
		if (isRendering) {
			return;
		}
		isRendering = true;
		const currentToken = ++renderToken;

		const containerWidth = previewContainer.clientWidth;
		const scale = containerWidth / pageWidth;
		const viewport = pdfPage.getViewport({ scale });
		previewScale = scale;

		previewCanvas.width = viewport.width;
		previewCanvas.height = viewport.height;
		previewWidth = viewport.width;
		previewHeight = viewport.height;

		const ctx = previewCanvas.getContext('2d');
		if (!ctx) {
			isRendering = false;
			return;
		}
		try {
			await pdfPage.render({ canvasContext: ctx, viewport }).promise;
		} finally {
			if (currentToken === renderToken) {
				isRendering = false;
			}
		}
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function ensurePageStamps(page: number) {
		if (!stampsByPage[page]) {
			stampsByPage = { ...stampsByPage, [page]: [] };
		}
		return stampsByPage[page];
	}

	function getCurrentStamps() {
		return ensurePageStamps(currentPage);
	}

	$: currentStamps = getCurrentStamps();

	function setActiveStamp(id: string) {
		activeStampId = id;
	}

	function updateStamp(id: string, patch: Partial<Stamp>) {
		const current = getCurrentStamps();
		stampsByPage = {
			...stampsByPage,
			[currentPage]: current.map((item) => (item.id === id ? { ...item, ...patch } : item))
		};
		currentStamps = stampsByPage[currentPage];
	}

	function handleSizeInput(event: Event, id: string) {
		const target = event.currentTarget as HTMLInputElement;
		updateStamp(id, { size: Number(target.value) });
	}

	function handleXInput(event: Event, id: string) {
		const target = event.currentTarget as HTMLInputElement;
		updateStamp(id, { x: Number(target.value) / 100 });
	}

	function handleYInput(event: Event, id: string) {
		const target = event.currentTarget as HTMLInputElement;
		updateStamp(id, { y: Number(target.value) / 100 });
	}

	function addStamp() {
		const next: Stamp = {
			id: crypto.randomUUID(),
			text: defaultStampText,
			x: 0.62,
			y: 0.24,
			size: 12
		};
		const current = getCurrentStamps();
		stampsByPage = { ...stampsByPage, [currentPage]: [...current, next] };
		currentStamps = stampsByPage[currentPage];
		activeStampId = next.id;
	}

	function removeStamp(id: string) {
		const current = getCurrentStamps();
		stampsByPage = { ...stampsByPage, [currentPage]: current.filter((item) => item.id !== id) };
		if (activeStampId === id) {
			currentStamps = stampsByPage[currentPage];
			activeStampId = currentStamps[0]?.id ?? '';
		}
	}

	function startDrag(event: PointerEvent, id: string) {
		if (!overlayLayer || !previewWidth || !previewHeight) return;
		event.preventDefault();
		const rect = overlayLayer.getBoundingClientRect();
		const stamp = getCurrentStamps().find((item) => item.id === id);
		if (!stamp) return;

		const pointerX = event.clientX - rect.left;
		const pointerY = event.clientY - rect.top;
		dragOffsetX = pointerX - stamp.x * previewWidth;
		dragOffsetY = pointerY - stamp.y * previewHeight;
		dragTargetId = id;
		activeStampId = id;
		attachPointerListeners();
	}

	function moveDrag(event: PointerEvent) {
		if (resizeTargetId) {
			updateResize(event);
			return;
		}
		if (!dragTargetId || !overlayLayer || !previewWidth || !previewHeight) return;
		const rect = overlayLayer.getBoundingClientRect();
		const pointerX = event.clientX - rect.left;
		const pointerY = event.clientY - rect.top;
		const nextX = clamp((pointerX - dragOffsetX) / previewWidth, 0, 0.98);
		const nextY = clamp((pointerY - dragOffsetY) / previewHeight, 0, 0.98);
		updateStamp(dragTargetId, { x: nextX, y: nextY });
	}

	function endDrag(event: PointerEvent) {
		if (resizeTargetId) {
			resizeTargetId = null;
			detachPointerListeners();
			return;
		}
		if (!dragTargetId || !overlayLayer) return;
		dragTargetId = null;
		detachPointerListeners();
	}

	function startResize(event: PointerEvent, id: string) {
		if (!overlayLayer || !previewWidth || !pageWidth) return;
		event.stopPropagation();
		const stamp = getCurrentStamps().find((item) => item.id === id);
		if (!stamp) return;
		resizeTargetId = id;
		resizeStartX = event.clientX;
		resizeStartSize = stamp.size;
		attachPointerListeners();
	}

	function updateResize(event: PointerEvent) {
		if (!resizeTargetId || !previewWidth || !pageWidth) return;
		const deltaPx = event.clientX - resizeStartX;
		const deltaSize = deltaPx / Math.max(0.01, previewScale);
		const nextSize = clamp(resizeStartSize + deltaSize, 8, 64);
		updateStamp(resizeTargetId, { size: nextSize });
	}

	function attachPointerListeners() {
		if (isPointerListening) return;
		isPointerListening = true;
		window.addEventListener('pointermove', moveDrag);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	function detachPointerListeners() {
		if (!isPointerListening) return;
		isPointerListening = false;
		window.removeEventListener('pointermove', moveDrag);
		window.removeEventListener('pointerup', endDrag);
		window.removeEventListener('pointercancel', endDrag);
	}

	function handlePageInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const value = Number(target.value);
		if (!Number.isFinite(value)) return;
		const nextPage = clamp(Math.round(value), 1, Math.max(1, pdfPageCount));
		void goToPage(nextPage);
	}

	async function exportPDF() {
		if (!pdfBytes || pdfBytes.byteLength === 0) {
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
				const allStamps = Object.values(stampsByPage).flat();
				if (allStamps.some((stamp) => /[一-龯ぁ-んァ-ン]/.test(stamp.text))) {
					alert('日本語フォントが利用できません');
					return;
				}
				font = await pdfDoc.embedFont('Helvetica');
			}

			const pages = pdfDoc.getPages();
			pages.forEach((page, index) => {
				const pdfWidth = page.getWidth();
				const pdfHeight = page.getHeight();
				const pageIndex = index + 1;
				const stamps = stampsByPage[pageIndex] ?? [];
				stamps.forEach((stamp) => {
					if (!stamp.text.trim()) return;
					const paddingX = previewPaddingX / Math.max(0.01, previewScale);
					const paddingY = previewPaddingY / Math.max(0.01, previewScale);
					const x = stamp.x * pdfWidth + paddingX;
					const y = pdfHeight - stamp.y * pdfHeight - font.heightAtSize(stamp.size) - paddingY;
					page.drawText(stamp.text, { x, y, size: stamp.size, font });
				});
			});

			const out = await pdfDoc.save();
			const safeName = fileName ? fileName.replace(/\.pdf$/i, '') : 'receipt';
			saveAs(new Blob([out], { type: 'application/pdf' }), `inkrip_${safeName}.pdf`);
		} catch (e) {
			console.error('PDF export error', e);
			alert('PDF処理中にエラーが発生しました');
		}
	}
</script>

<svelte:head>
	<title>{$locale ? $t('meta.title') : 'inkrip | 領収書 PDF に宛名を印字する無料ツール'}</title>
	<meta
		name="description"
		content={$locale
			? $t('meta.description')
			: 'inkripは、Amazonの領収書 PDF に宛名を簡単に印字できる無料ツールです。ブラウザ完結・ファイル送信なしで安全に利用できます。'}
	/>
</svelte:head>

<!-- ========================================================= -->
<!-- HERO / 概要 -->
<!-- ========================================================= -->
<section class="hero">
	<h1>{$locale ? $t('hero.title') : 'PDF に文字をのせる。'}</h1>
	<p>
		{$locale
			? $t('hero.lead')
			: 'プレビューを見ながら、宛名や備考を静かに配置。処理はすべてブラウザ内で完結します。'}
	</p>
</section>

<section class="section" id="tool">
	<div class="tool">
		<div class="tool-left">
			<div class="panel">
				<h2>{$locale ? $t('ui.pdf') : 'PDF'}</h2>
				<label class="dropzone" on:drop={handleFileDrop} on:dragover={handleDragOver}>
					<input class="file-input" type="file" accept="application/pdf" on:change={handleFileUpload} />
					<div class="dropzone-title">
						{$locale ? $t('ui.chooseOrDrop') : 'PDF を選択 または ドラッグ&ドロップ'}
					</div>
					<div class="dropzone-name">{fileName || ($locale ? $t('ui.noFile') : '未選択')}</div>
				</label>
			</div>

			<div class="panel">
				<div class="panel-header">
					<h2>{$locale ? $t('ui.text') : 'テキスト'}</h2>
					<div class="page-badge">
						{$locale ? $t('ui.page') : 'ページ'} {currentPage}/{Math.max(1, pdfPageCount)}
					</div>
				</div>
				<p class="panel-note">
					{$locale ? $t('ui.pageOnly') : 'このページにのみ反映されます。'}
				</p>
				<div class="stack">
					<button class="btn-ghost" type="button" on:click={addStamp}>
						{$locale ? $t('ui.add') : '追加'}
					</button>
					{#each currentStamps as stamp (stamp.id)}
					<div class="stamp-row">
						<button class="btn-icon" type="button" on:click={() => removeStamp(stamp.id)}>
							×
						</button>
								<input
							class="input"
							type="text"
							bind:value={stamp.text}
							on:focus={() => setActiveStamp(stamp.id)}
							placeholder={$locale ? $t('ui.nameNote') : '宛名 / 備考'}
						/>
						<div class="stamp-controls">
							<label>
								<span>{$locale ? $t('ui.size') : 'サイズ'}</span>
								<input
									class="range"
									type="range"
									min="8"
									max="32"
										step="1"
										value={stamp.size}
										on:input={(event) => handleSizeInput(event, stamp.id)}
									/>
							</label>
							<label>
								<span>X%</span>
								<input
									class="input"
										type="number"
										min="0"
										max="98"
										value={Math.round(stamp.x * 100)}
										on:input={(event) => handleXInput(event, stamp.id)}
									/>
							</label>
							<label>
								<span>Y%</span>
								<input
									class="input"
										type="number"
										min="0"
										max="98"
										value={Math.round(stamp.y * 100)}
										on:input={(event) => handleYInput(event, stamp.id)}
									/>
								</label>
							</div>
						</div>
					{/each}
				</div>
			</div>

		</div>

		<div class="tool-right">
			<div class="panel">
				<div class="panel-header">
					<div class="preview-left">
						<h2>{$locale ? $t('ui.preview') : 'プレビュー'}</h2>
						<div class="page-nav">
							<button
								class="btn-ghost"
								type="button"
								on:click={() => goToPage(currentPage - 1)}
								disabled={!pdfBytes || currentPage <= 1}
							>
								{$locale ? $t('ui.prev') : '前'}
							</button>
							<div class="page-indicator">
								<input
									class="input"
									type="number"
									min="1"
									max={Math.max(1, pdfPageCount)}
									value={currentPage}
									on:change={handlePageInput}
								/>
								<span>/ {Math.max(1, pdfPageCount)}</span>
							</div>
							<button
								class="btn-ghost"
								type="button"
								on:click={() => goToPage(currentPage + 1)}
								disabled={!pdfBytes || currentPage >= Math.max(1, pdfPageCount)}
							>
								{$locale ? $t('ui.next') : '次'}
							</button>
						</div>
					</div>
					<div class="preview-actions">
						<button on:click={exportPDF} disabled={!pdfBytes || !isReady} class="btn">
							{$locale ? $t('ui.export') : 'PDF を書き出す'}
						</button>
					</div>
				</div>
				<div
					class="preview"
					bind:this={previewContainer}
					on:drop={handleFileDrop}
					on:dragover={handleDragOver}
				>
					{#if !pdfBytes}
						<div class="label">
							{$locale ? $t('ui.uploadHint') : 'PDF をアップロードすると表示されます。'}
						</div>
					{:else}
						<div
							class="page-layer"
							bind:this={pageLayer}
							style={`width:${previewWidth}px;height:${previewHeight}px;`}
						>
							<canvas bind:this={previewCanvas}></canvas>
							<div class="overlay" bind:this={overlayLayer}>
								{#each currentStamps as stamp (stamp.id)}
									<div
										class="stamp"
										style={`left:${stamp.x * previewWidth}px; top:${stamp.y * previewHeight}px; font-size:${Math.max(
											10,
											stamp.size * previewScale
										)}px;`}
										on:pointerdown={(event) => startDrag(event, stamp.id)}
										on:click={() => setActiveStamp(stamp.id)}
									>
										{stamp.text || 'テキスト未入力'}
										<span
											class="resize-handle"
											on:pointerdown={(event) => startResize(event, stamp.id)}
										></span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
				<div class="label preview-hint">
					{$locale ? $t('ui.dragHint') : 'ドラッグで位置を調整できます。'}
					{#if isJapaneseFontReady}
						{$locale ? $t('ui.jpFontOk') : '日本語フォントは利用可能です。'}
					{:else}
						{$locale ? $t('ui.jpFontNg') : '日本語フォントを読み込めませんでした。'}
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<div class="ad-inline"></div>
