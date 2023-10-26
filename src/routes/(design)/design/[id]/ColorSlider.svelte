<script lang="ts">
	export let colors: string[] | readonly string[]
	export let color: string
	export let onInput: (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement
		}
	) => void

	$: colorMargin = 1 / (colors.length * 3.5)
	$: colorsGradient = `linear-gradient(to right, ${colors
		.map((c, i) => {
			const p = i / (colors.length - 1)
			const start = Math.max(0, p - colorMargin)
			const end = Math.min(1, p + colorMargin)
			return `${c} ${Math.round(start * 100)}% ${Math.round(end * 100)}%`
		})
		.join(', ')})`
</script>

<div class="relative flex h-4 overflow-clip rounded-full">
	<div class="mx-[0.75rem] h-full grow" style:background={colorsGradient} />
	<div class="absolute left-0 h-full w-4" style:background-color={colors[0]} />
	<div
		class="absolute right-0 h-full w-4"
		style:background-color={colors[colors.length - 1]}
	/>
</div>
<input
	type="range"
	min={0}
	max={colors.length - 1}
	step="1"
	value={colors.indexOf(color)}
	on:input={onInput}
	class="range"
/>
