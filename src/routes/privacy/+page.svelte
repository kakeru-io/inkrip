<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from '$lib/fetchBizInfo';
	import { locale, t } from '$lib/i18n';
	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="legal-wrap">
	<h1 class="legal-title">{$locale ? $t('privacy.title') : 'プライバシーポリシー'}</h1>
	<p class="legal-updated">{$locale ? $t('privacy.updated') : '最終更新日：2025年1月'}</p>

	<div class="legal-card">

		{#if info}
			<p>
				{$locale
					? $t('privacy.intro', { values: { business: info.business_name } })
					: `本プライバシーポリシーは、${info.business_name}（以下「当社」）が提供する PDF 宛名印字サービス「inkrip」における利用者情報の取り扱いについて定めるものです。`}
			</p>
		{:else}
			<p>{$locale ? $t('privacy.loading') : '事業者情報を読み込み中...'}</p>
		{/if}

		<h2>{$locale ? $t('privacy.collectTitle') : '1. 収集する情報'}</h2>
		<ul>
			<li>
				{$locale ? $t('privacy.collect1') : 'お問い合わせフォームで送信される氏名・メールアドレス'}
			</li>
			<li>
				{$locale ? $t('privacy.collect2') : '利用状況に関する匿名データ（アクセスログ等）'}
			</li>
			<li>
				{$locale
					? $t('privacy.collect3')
					: 'アップロードされた PDF：サーバーには送信されず、すべて端末内で処理されます'}
			</li>
		</ul>

		<h2>{$locale ? $t('privacy.useTitle') : '2. 利用目的'}</h2>
		<ul>
			<li>{$locale ? $t('privacy.use1') : 'お問い合わせ対応'}</li>
			<li>{$locale ? $t('privacy.use2') : 'サービス改善のための分析'}</li>
			<li>{$locale ? $t('privacy.use3') : '新機能の開発'}</li>
		</ul>

		<h2>{$locale ? $t('privacy.shareTitle') : '3. 第三者提供'}</h2>
		<p>
			{$locale
				? $t('privacy.shareBody')
				: '法令に基づく場合を除き、本人の同意なく提供することはありません。'}
		</p>

		<h2>{$locale ? $t('privacy.contactTitle') : '4. お問い合わせ'}</h2>
		{#if info}
			<p class="legal-contact">{info.contact_email}</p>
			<p class="legal-note">
				{$locale
					? $t('privacy.contactNote', { values: { business: info.business_name } })
					: `${info.business_name} プライバシー担当`}
			</p>
		{/if}

	</div>
</section>
