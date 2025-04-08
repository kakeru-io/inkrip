<script context="module">
	// Disable SSR for compatibility
	export const ssr = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { PDFDocument, StandardFonts } from 'pdf-lib';
	import saveAs from 'file-saver';
	import fontkit from '@pdf-lib/fontkit';

	const fontPath = "/fonts/NotoSansJP-Regular.ttf";

	// Coordinates for the text field (Amazon receipt specific)
	let fieldX = 663.9998474121094;
	let fieldY = 94.90902709960938;
	let fieldW = 150;
	let fieldH = 40;

	// External field (name)
	let address = ""; // Default empty

	// PDF file data
	let pdfBytes = null;

	// PDF.js (dynamically imported)
	let pdfjsLib;

	// Scale used for coordinate calculations
	let scale = 1.5;

	// Dragging and editing states
	let mode = "idle"; // 'idle' | 'editing' | 'dragging'
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	// Optional Japanese font
	let fontBytes = null;

	// プレビュー更新用のキャンバス参照
	let previewCanvas;

	// On mount: load pdf.js & optional Japanese font
	onMount(async () => {
		const pdfjsModule = await import("pdfjs-dist");
		pdfjsLib = pdfjsModule.default;

		try {
			const fontRes = await fetch(fontPath);
			if (fontRes.ok) {
				fontBytes = new Uint8Array(await fontRes.arrayBuffer());
			} else {
				console.warn("Could not fetch NotoSansJP font; fallback to WinAnsi");
			}
		} catch (err) {
			console.warn("Font fetch error:", err);
		}
	});

	/**
	 * Load PDF file
	 */
	function handleFileUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = async () => {
			pdfBytes = new Uint8Array(reader.result);
		};
		reader.readAsArrayBuffer(file);
	}

	/**
	 * Rendering PDF with the name inserted at the fixed coordinates
	 */
	async function rendering() {

		const pdfDoc = await PDFDocument.load(pdfBytes);
		pdfDoc.registerFontkit(fontkit);

		// Attempt to embed Japanese font if available
		let customFont;
		if (fontBytes) {
			try {
				customFont = await pdfDoc.embedFont(fontBytes);
			} catch (err) {
				console.warn("Failed to embed JP font => fallback to Standard", err);
			}
		}
		const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

		const [page] = pdfDoc.getPages();
		const pageHeight = page.getHeight();

		// Right-end anchored text
		const fontSize = 8;
		const text = address;
		let measureFont = customFont || fallbackFont;

		// Measure text width
		let textWidth = 0;
		try {
			textWidth = measureFont.widthOfTextAtSize(text, fontSize);
		} catch {
			textWidth = text.length * (fontSize * 0.6);
		}

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

		const outBytes = await pdfDoc.save();

		return outBytes;
	}

	/**
	 * Export PDF with the name inserted at the fixed coordinates
	 */
	async function exportPDF() {
		if (!pdfBytes) {
			alert("Please select a PDF file first.");
			return;
		}

		const pdfName = address + "_receipt.pdf"

		saveAs(new Blob([await rendering()], { type: "application/pdf" }), pdfName);
	}

	/**
	 * Click on text field => toggles editing
	 */
	function onClickField(e) {
		if (mode !== "dragging") {
			mode = (mode === "editing") ? "idle" : "editing";
			e.stopPropagation();
		}
	}

	/**
	 * Click outside => if editing, return to idle
	 */
	function onClickOutside() {
		if (mode === "editing") {
			mode = "idle";
		}
	}

	/**
	 * Pointerdown => start drag (unless editing)
	 */
	function pointerDownField(e) {
		if (mode === "editing") return;
		isDragging = true;
		mode = "dragging";
		dragOffset.x = e.clientX - fieldX;
		dragOffset.y = e.clientY - fieldY;
		e.stopPropagation();
	}

	/**
	 * Move => update field position
	 */
	function pointerMove(e) {
		if (!isDragging) return;
		fieldX = e.clientX - dragOffset.x;
		fieldY = e.clientY - dragOffset.y;
	}

	/**
	 * Pointerup => finalize drag
	 */
	function pointerUp() {
		if (isDragging) {
			isDragging = false;
			mode = "idle";
		}
	}
</script>

<main
	class="page-container flex flex-col min-h-screen bg-white text-black font-sans"
	on:click={onClickOutside}
	on:mousemove={pointerMove}
	on:mouseup={pointerUp}
>
	<!-- Header: inkrip (like a Tesla wide logo) -->
	<header
		class="bg-black text-white text-center p-8 text-2xl tracking-widest font-bold uppercase"
		style="letter-spacing: 17px;"
	>
		inkrip
	</header>

	<!-- Main Content -->
	<div class="main-content flex-1 p-4 w-full max-w-screen-md mx-auto">
		<!-- Explanation / Notice -->
		<div class="desc-card bg-white border border-gray-300 p-4 mb-4 rounded">
			<label class="block font-semibold mb-2">What is inkrip?</label>
			<p>
				This service (inkrip) currently works with <strong>Amazon receipts</strong> only.
				It places your name at a specific position on the PDF.
			</p>
			<p class="mt-2">
				<strong>Steps to use:</strong><br/>
				1. Select your Amazon receipt PDF.<br/>
				2. Enter your name below.<br/>
				3. Click <em>Export PDF</em> to download the modified file.
			</p>
		</div>

		<!-- PDF File -->
		<div class="form-card bg-white border border-gray-300 p-4 mb-4 rounded">
			<label class="block font-semibold mb-2">PDF File (Amazon Receipt)</label>
			<input
				type="file"
				class="w-full p-2 border border-gray-400 rounded"
				accept="application/pdf"
				on:change={handleFileUpload}
			/>
		</div>

		<!-- Name Field -->
		<div class="form-card bg-white border border-gray-300 p-4 mb-4 rounded">
			<label class="block font-semibold mb-2">Recipient Name</label>
			<input
				type="text"
				bind:value={address}
				placeholder="inkrip"
				class="w-full p-2 border border-gray-400 rounded"
			/>
		</div>

		<!-- PDFプレビュー領域 -->
<!--		<div class="preview-container border border-gray-400 mb-4">-->
<!--			<canvas bind:this={previewCanvas} class="w-full" style="height: 300px;"></canvas>-->
<!--		</div>-->

		<!-- Export Button -->
		<button
			class="btn bg-black text-white px-4 py-2 rounded font-semibold mt-2 hover:bg-gray-900"
			on:click={exportPDF}
		>
			Export PDF
		</button>
	</div>

	<!-- Footer -->
	<footer class="bg-gray-100 text-gray-700 text-center p-3">
		<p class="text-sm">&copy; 2025 inkrip</p>
	</footer>
</main>

<!--
  もしドラッグ＆ドロップでフィールド位置を動かしたい場合は、
  下記のように absolute な要素を Tailwind で定義する例。

  <div
    class="absolute border-2 border-red-500 bg-transparent text-black flex justify-end items-center pr-1 text-sm"
    style="left: {fieldX}px; top: {fieldY}px; width: {fieldW}px; height: {fieldH}px;"
    on:pointerdown={pointerDownField}
    on:click={onClickField}
  >
    {#if mode === "editing"}
      <textarea
        class="w-full h-full border-none outline-none bg-transparent resize-none text-right"
        bind:value={address}
      />
    {:else}
      {address}
    {/if}
  </div>
-->
