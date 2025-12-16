<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from "$lib/fetchBizInfo";

	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="page-wrap">

	<h1 class="title">特定商取引法に基づく表記</h1>
	<p class="updated">最終更新日：2025年1月</p>

	<div class="card">

		{#if info}

			<h2>販売事業者</h2>
			<p>{info.business_name}</p>

			<h2>運営責任者</h2>
			<p>{info.responsible_person}</p>

			<h2>所在地</h2>
			<p>{info.address}</p>

			<h2>連絡先</h2>
			<p class="contact">{info.contact_email}</p>
			<p class="note">※ お問い合わせはメールにて承っております。</p>

		{:else}
			<p>事業者情報を読み込み中...</p>
		{/if}

		<h2>サービス名称</h2>
		<p>inkrip（PDF領収書宛名印字ツール）</p>

		<h2>販売価格</h2>
		<p>
			本ツール（宛名印字処理）は無料で提供しています。
			ただし、お問い合わせによりオーダーいただいたシステムやオプションについては有料となる場合があります。
		</p>
		<p class="note">※ 価格は依頼内容により見積もりを提示します。</p>

		<h2>商品代金以外の必要料金</h2>
		<ul>
			<li>通信費（インターネット接続に必要な費用）</li>
			<li>銀行振込の場合の振込手数料</li>
		</ul>

		<h2>引き渡し時期</h2>
		<p>
			宛名印字機能は即時ご利用いただけます。
			有料オプションは契約成立後に個別スケジュールを提示します。
		</p>

		<h2>お支払い方法</h2>
		<p>
			有料サービスをご依頼いただく場合、銀行振込またはオンライン決済（Stripe等）を利用します。
		</p>

		<h2>返品・キャンセルについて</h2>
		<p>
			無料サービスのため返品は不要です。
			有料のカスタム作業については、作業開始後のキャンセルは受け付けておりません。
		</p>

		<h2>動作環境</h2>
		<p>
			本サービスはブラウザ上で動作し、PDF処理はすべてローカルで実行されます。
			推奨ブラウザ：Chrome、Safari、Edge 最新版
		</p>

	</div>
</section>

<style>
    .page-wrap {
        max-width: 860px;
        margin: auto;
        padding: 80px 24px;
        font-family: "Noto Sans JP", sans-serif;
        color: #0A1A2F;
    }

    .title {
        font-size: 42px;
        font-weight: 300;
        margin-bottom: 8px;
    }

    .updated {
        font-size: 14px;
        opacity: 0.6;
        margin-bottom: 40px;
    }

    .card {
        background: rgba(255,255,255,0.7);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 40px;
        border: 1px solid rgba(0,0,0,0.08);
        line-height: 1.9;
    }

    h2 {
        font-size: 22px;
        font-weight: 300;
        margin-top: 36px;
        margin-bottom: 10px;
    }

    ul {
        list-style: disc;
        margin-left: 24px;
    }

    .contact {
        font-weight: 600;
        font-size: 15px;
    }

    .note {
        font-size: 13px;
        opacity: 0.75;
        margin-top: 4px;
    }
</style>
