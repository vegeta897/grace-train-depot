<script lang="ts">
	export let id = 'color'
	export let colors: string[] | readonly string[]
	export let color: string
	export let onInput: (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) => void

	$: colorsGradient = `linear-gradient(to right, ${colors
		.map((c, i) => `${c} ${Math.round((i / (colors.length - 1)) * 100)}%`)
		.join(', ')})`
	$: capsGradient = `linear-gradient(to right, ${colors[0]} 50%, ${
		colors[colors.length - 1]
	} 50%)`
</script>

<input
	{id}
	type="range"
	min={0}
	max={colors.length - 1}
	step="1"
	value={colors.indexOf(color)}
	on:input={onInput}
	class="range-gradient range"
	style:background="{colorsGradient}, {capsGradient}"
	style:background-position="0.75rem 0, 0"
	style:background-size="calc(100% - 1.5rem), 100%"
	style:background-repeat="no-repeat"
	style:--range-gradient-color={color}
/>
