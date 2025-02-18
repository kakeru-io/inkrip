<script lang="ts">
	import Button from '@smui/button';
	import Card, { Content as CardContent } from '@smui/card';

	let count = 0;
</script>

<div class="mt-4">
	<h1 class="text-3xl">bitboxx front template</h1>

	<Button class="mt-2" variant="outlined" on:click={() => count++}>This is a button!</Button>

	<Card class="mt-2">
		<CardContent class="mdc-typography--body2">Count: {count}</CardContent>
	</Card>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.white);
	}
</style>
