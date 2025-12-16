<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from "$lib/fetchBizInfo";
	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="page-wrap">

	<h1 class="title">プライバシーポリシー</h1>
	<p class="updated">最終更新日：2025年1月</p>

	<div class="card">

		{#if info}
			<p>
				本プライバシーポリシーは、{info.business_name}（以下「当社」）が提供する
				PDF宛名印字サービス「inkrip」における利用者情報の取り扱いについて定めるものです。
			</p>
		{:else}
			<p>事業者情報を読み込み中...</p>
		{/if}

		<h2>1. 収集する情報</h2>
		<ul>
			<li>お問い合わせフォームで送信される氏名・メールアドレス</li>
			<li>利用状況に関する匿名データ（アクセスログ等）</li>
			<li>アップロードされたPDF：<b>サーバーには送信されず、すべて端末内で処理されます</b></li>
		</ul>

		<h2>2. 利用目的</h2>
		<ul>
			<li>お問い合わせ対応</li>
			<li>サービス改善のための分析</li>
			<li>新機能の開発</li>
		</ul>

		<h2>3. 第三者提供</h2>
		<p>法令に基づく場合を除き、本人の同意なく提供することはありません。</p>

		<h2>4. お問い合わせ</h2>
		{#if info}
			<p class="contact">{info.contact_email}</p>
			<p class="note">{info.business_name} プライバシー担当</p>
		{/if}

	</div>
</section>

<style>
    /* デザインは legal と完全同じ */
    .page-wrap { max-width: 860px; margin: auto; padding: 80px 24px; font-family: "Noto Sans JP"; color: #0A1A2F; }
    .title { font-size: 42px; font-weight: 300; margin-bottom: 8px; }
    .updated { font-size: 14px; opacity: 0.6; margin-bottom: 40px; }
    .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 16px; padding: 40px; border: 1px solid rgba(0,0,0,0.08); line-height: 1.9; }
    h2 { font-size: 22px; font-weight: 300; margin-top: 36px; margin-bottom: 10px; }
    ul { list-style: disc; margin-left: 24px; }
    .contact { font-weight: 600; font-size: 15px; }
    .note { font-size: 13px; opacity: 0.75; margin-top: 4px; }
</style>
