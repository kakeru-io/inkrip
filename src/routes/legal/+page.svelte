<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from '$lib/fetchBizInfo';
	import { locale, t } from '$lib/i18n';

	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="legal-wrap">
	<h1 class="legal-title">
		{$locale ? $t('legal.title') : '特定商取引法に基づく表記'}
	</h1>
	<p class="legal-updated">{$locale ? $t('legal.updated') : '最終更新日：2025年1月'}</p>

	<div class="legal-card">

		{#if info}

			<h2>{$locale ? $t('legal.business') : '販売事業者'}</h2>
			<p>{info.business_name}</p>

			<h2>{$locale ? $t('legal.responsible') : '運営責任者'}</h2>
			<p>{info.responsible_person}</p>

			<h2>{$locale ? $t('legal.address') : '所在地'}</h2>
			<p>{info.address}</p>

			<h2>{$locale ? $t('legal.contact') : '連絡先'}</h2>
			<p class="legal-contact">{info.contact_email}</p>
			<p class="legal-note">
				{$locale ? $t('legal.contactNote') : '※ お問い合わせはメールにて承っております。'}
			</p>

		{:else}
			<p>{$locale ? $t('legal.loading') : '事業者情報を読み込み中...'}</p>
		{/if}

		<h2>{$locale ? $t('legal.serviceName') : 'サービス名称'}</h2>
		<p>
			{$locale ? $t('legal.serviceValue') : 'inkrip（PDF 領収書宛名印字ツール）'}
		</p>

		<h2>{$locale ? $t('legal.pricing') : '販売価格'}</h2>
		<p>
			{$locale
				? $t('legal.pricingBody')
				: '本ツール（宛名印字処理）は無料で提供しています。お問い合わせによりオーダーいただいたシステムやオプションについては有料となる場合があります。'}
		</p>
		<p class="legal-note">
			{$locale ? $t('legal.pricingNote') : '※ 価格は依頼内容により見積もりを提示します。'}
		</p>

		<h2>{$locale ? $t('legal.fees') : '商品代金以外の必要料金'}</h2>
		<ul>
			<li>
				{$locale ? $t('legal.fees1') : '通信費（インターネット接続に必要な費用）'}
			</li>
			<li>{$locale ? $t('legal.fees2') : '銀行振込の場合の振込手数料'}</li>
		</ul>

		<h2>{$locale ? $t('legal.delivery') : '引き渡し時期'}</h2>
		<p>
			{$locale
				? $t('legal.deliveryBody')
				: '宛名印字機能は即時ご利用いただけます。有料オプションは契約成立後に個別スケジュールを提示します。'}
		</p>

		<h2>{$locale ? $t('legal.payment') : 'お支払い方法'}</h2>
		<p>
			{$locale
				? $t('legal.paymentBody')
				: '有料サービスをご依頼いただく場合、銀行振込またはオンライン決済（Stripe 等）を利用します。'}
		</p>

		<h2>{$locale ? $t('legal.refund') : '返品・キャンセルについて'}</h2>
		<p>
			{$locale
				? $t('legal.refundBody')
				: '無料サービスのため返品は不要です。有料のカスタム作業については、作業開始後のキャンセルは受け付けておりません。'}
		</p>

		<h2>{$locale ? $t('legal.environment') : '動作環境'}</h2>
		<p>
			{$locale
				? $t('legal.environmentBody')
				: '本サービスはブラウザ上で動作し、PDF 処理はすべてローカルで実行されます。推奨ブラウザ：Chrome、Safari、Edge 最新版'}
		</p>

	</div>
</section>
