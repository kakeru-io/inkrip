<script lang="ts">
	export const ssr = false;
	import { fetchBizInfo } from '$lib/fetchBizInfo';
	import { locale, t } from '$lib/i18n';
	let info: any = null;
	fetchBizInfo().then((res) => (info = res));
</script>

<section class="legal-wrap">
	<h1 class="legal-title">{$locale ? $t('terms.title') : '利用規約'}</h1>
	<p class="legal-updated">{$locale ? $t('terms.updated') : '最終更新日：2025年1月'}</p>

	<div class="legal-card">

		{#if info}
			<p>
				{$locale
					? $t('terms.intro', { values: { business: info.business_name } })
					: `本利用規約（以下「本規約」）は、${info.business_name}（以下「当社」）が提供する PDF 領収書宛名印字サービス「inkrip」の利用条件を定めるものです。`}
			</p>
		{:else}
			<p>{$locale ? $t('terms.loading') : '読み込み中...'}</p>
		{/if}

		<h2>{$locale ? $t('terms.serviceTitle') : '1. サービス内容'}</h2>
		<p>
			{$locale
				? $t('terms.serviceBody')
				: '本サービスは PDF 領収書への宛名印字を無料で提供します。大量処理・カスタム開発などは別途契約となります。'}
		</p>

		<h2>{$locale ? $t('terms.prohibitTitle') : '2. 禁止事項'}</h2>
		<ul>
			<li>{$locale ? $t('terms.prohibit1') : '不正アクセス・解析行為'}</li>
			<li>{$locale ? $t('terms.prohibit2') : '営利目的の不正利用'}</li>
			<li>{$locale ? $t('terms.prohibit3') : '第三者の権利侵害'}</li>
		</ul>

		<h2>{$locale ? $t('terms.disclaimerTitle') : '3. 免責事項'}</h2>
		<p>
			{$locale
				? $t('terms.disclaimerBody')
				: 'PDF 仕様の違いにより印字位置が完全に一致しない場合があります。当社は利用により生じたいかなる損害にも責任を負いません。'}
		</p>

		<h2>{$locale ? $t('terms.contactTitle') : '4. お問い合わせ'}</h2>
		{#if info}
			<p class="legal-contact">{info.contact_email}</p>
			<p class="legal-note">
				{$locale
					? $t('terms.contactNote', { values: { business: info.business_name } })
					: `${info.business_name} サポート担当`}
			</p>
		{/if}

	</div>
</section>
