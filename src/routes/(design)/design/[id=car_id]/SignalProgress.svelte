<script lang="ts">
	export let color: string
	export let progress: number
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class="w-full"
	viewBox="0 0 100 16"
	role="progressbar"
>
	<rect
		stroke={color}
		rx="7"
		fill="none"
		x="1.5"
		y="1.5"
		width="97"
		height="13"
		stroke-width="3"
	/>
	<rect
		class="transition-[width] duration-300"
		fill={color}
		rx="6.5"
		x="1.5"
		y="1.5"
		width={97 * progress}
		height="13"
	/>
</svg>
