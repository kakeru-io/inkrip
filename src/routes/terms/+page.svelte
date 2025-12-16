<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from "$lib/fetchBizInfo";
	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="page-wrap">

	<h1 class="title">利用規約</h1>
	<p class="updated">最終更新日：2025年1月</p>

	<div class="card">

		{#if info}
			<p>
				本利用規約（以下「本規約」）は、{info.business_name}（以下「当社」）が提供する
				PDF領収書宛名印字サービス「inkrip」の利用条件を定めるものです。
			</p>
		{:else}
			<p>読み込み中...</p>
		{/if}

		<h2>1. サービス内容</h2>
		<p>
			本サービスはPDF領収書への宛名印字を無料で提供します。
			大量処理・カスタム開発などは別途契約となります。
		</p>

		<h2>2. 禁止事項</h2>
		<ul>
			<li>不正アクセス・解析行為</li>
			<li>営利目的の不正利用</li>
			<li>第三者の権利侵害</li>
		</ul>

		<h2>3. 免責事項</h2>
		<p>
			PDF仕様の違いにより印字位置が完全に一致しない場合があります。
			当社は利用により生じたいかなる損害にも責任を負いません。
		</p>

		<h2>4. お問い合わせ</h2>
		{#if info}
			<p class="contact">{info.contact_email}</p>
			<p class="note">{info.business_name} サポート担当</p>
		{/if}

	</div>
</section>

<style>
    /* デザインは legal と同じ */
    .page-wrap { max-width: 860px; margin: auto; padding: 80px 24px; font-family: "Noto Sans JP"; color: #0A1A2F; }
    .title { font-size: 42px; font-weight: 300; margin-bottom: 8px; }
    .updated { font-size: 14px; opacity: 0.6; margin-bottom: 40px; }
    .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 16px; padding: 40px; border: 1px solid rgba(0,0,0,0.08); line-height: 1.9; }
    h2 { font-size: 22px; font-weight: 300; margin-top: 36px; margin-bottom: 10px; }
    ul { list-style: disc; margin-left: 24px; }
    .contact { font-weight: 600; font-size: 15px; }
    .note { font-size: 13px; opacity: 0.75; margin-top: 4px; }
</style>
