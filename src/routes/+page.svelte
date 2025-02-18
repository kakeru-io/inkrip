<script context="module">
	// Disable SSR for compatibility
	export const ssr = false;
</script>

<script>
	import { onMount } from 'svelte';
	import { PDFDocument, StandardFonts } from 'pdf-lib';
	import saveAs from 'file-saver';
	import fontkit from '@pdf-lib/fontkit';

	// Coordinates for the text field (Amazon receipt specific)
	let fieldX = 663.9998474121094;
	let fieldY = 91.90902709960938;
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

	// On mount: load pdf.js & optional Japanese font
	onMount(async () => {
		const pdfjsModule = await import("pdfjs-dist");
		pdfjsLib = pdfjsModule.default;

		try {
			const fontRes = await fetch("/fonts/NotoSansJP-Regular.ttf");
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
	 * Export PDF with the name inserted at the fixed coordinates
	 */
	async function exportPDF() {
		if (!pdfBytes) {
			alert("Please select a PDF file first.");
			return;
		}

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
		const fontSize = 12;
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
		saveAs(new Blob([outBytes], { type: "application/pdf" }), "modified_receipt.pdf");
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

<style>
    /* Minimal black & white design */
    .page-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: #fff;
        color: #000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    header {
        background: #000;
        color: #fff;
        text-align: center;
        padding: 2rem;       /* Larger area to evoke a Tesla-like wide logo */
        font-size: 2rem;     /* Bold, large text */
        letter-spacing: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    footer {
        background: #f5f5f5;
        color: #333;
        text-align: center;
        padding: 0.75rem;
    }

    .main-content {
        flex: 1;
        padding: 1rem;
        max-width: 600px;
        margin: 0 auto;
    }

    /* Simple explanation card */
    .desc-card {
        background: #fff;
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
    }

    /* Form card */
    .form-card {
        background: #fff;
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
    }

    label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    input[type="text"],
    input[type="file"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #999;
        border-radius: 4px;
    }

    /* Hide file name? If we want to allow scrolling: */
    input[type="file"] {
        white-space: nowrap;
        overflow: auto;
    }

    /* Export button, slightly bigger */
    .btn {
        background: #000;
        color: #fff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        margin-top: 1rem;
        cursor: pointer;
    }
    .btn:hover {
        background: #222;
    }

    /* Red-frame text field (drag & edit) */
    .text-field {
        position: absolute;
        border: 2px solid red;
        background: transparent;
        color: #000;
        display: flex;
        justify-content: flex-end; /* right align */
        align-items: center;
        padding-right: 4px;
        font-size: 14px;
    }

    .text-field.editing {
        background: transparent;
    }

    /* For editing text area */
    .text-area {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        resize: none;
        text-align: right;
    }
</style>

<main
	class="page-container"
	on:click={onClickOutside}
	on:mousemove={pointerMove}
	on:mouseup={pointerUp}
>
	<!-- Header: inkrip (like a Tesla wide logo) -->
	<header>inkrip</header>

	<div class="main-content">
		<!-- Explanation / Notice -->
		<div class="desc-card">
			<p>
				This service currently works with <strong>Amazon receipts</strong> only.
				It places your name at a specific position on the PDF.
			</p>
			<p style="margin-top:0.5rem;">
				<strong>Steps to use:</strong><br/>
				1. Select your Amazon receipt PDF.<br/>
				2. Enter your name below (or drag the red frame if needed).<br/>
				3. Click <em>Export PDF</em> to download the modified file.
			</p>
		</div>

		<!-- Name Field -->
		<div class="form-card">
			<label>Recipient Name</label>
			<input
				type="text"
				bind:value={address}
				placeholder="inkrip"
			/>
		</div>

		<!-- PDF File -->
		<div class="form-card">
			<label>PDF File (Amazon Receipt)</label>
			<input
				type="file"
				accept="application/pdf"
				on:change={handleFileUpload}
			/>
		</div>

		<!-- Red text field (draggable) -->
<!--		<div-->
<!--			class="text-field {mode}"-->
<!--			style="left:{fieldX}px; top:{fieldY}px; width:{fieldW}px; height:{fieldH}px;"-->
<!--			on:pointerdown={pointerDownField}-->
<!--			on:click={onClickField}-->
<!--		>-->
<!--			{#if mode === "editing"}-->
<!--				<textarea class="text-area" bind:value={address} />-->
<!--			{:else}-->
<!--				{address}-->
<!--			{/if}-->
<!--		</div>-->

		<!-- Export Button -->
		<button class="btn" on:click={exportPDF}>
			Export PDF
		</button>
	</div>

	<!-- Footer -->
	<footer>
		<p>
			<span style="font-size: 12px; color: gray">© 2025 inkrip / powered by bootware</span>
		</p>
	</footer>
</main>
