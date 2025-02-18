<script lang="ts">
    export let fontSize: number;
    export let spacingRatio: number;
    const calculateSpacing = (size: number, ratio: number) => Math.round(size * (ratio / 100));
</script>

<span style={`font-size: ${fontSize}px`} class="{`tracking-[${calculateSpacing(fontSize, spacingRatio)}px] mr-[-${calculateSpacing(fontSize, spacingRatio)}px]`}">
  <slot></slot>
</span>
