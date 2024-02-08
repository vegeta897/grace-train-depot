<script lang="ts">
	export let carCount: number

	function getTallyNumbers(carCount: number) {
		const tally: (1 | 5 | 25 | 100 | '+')[] = []
		while (carCount > 0) {
			const number = carCount >= 100 ? 100 : carCount >= 25 ? 25 : carCount >= 5 ? 5 : 1
			tally.push(number)
			carCount -= number
		}
		tally.push('+')
		return tally
	}
	$: tallyNumbers = getTallyNumbers(carCount)
</script>

<div
	class="grid grid-flow-row-dense grid-cols-[repeat(auto-fill,_minmax(1.75rem,_1fr))] items-end gap-2 self-stretch"
>
	{#each tallyNumbers as number}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 70 56"
			class:col-span-2={number === 5}
			class:row-span-2={number === 5}
			class:col-span-3={number === 25}
			class:row-span-3={number === 25}
			class:col-span-4={number === 100}
			class:row-span-4={number === 100}
		>
			<path
				class="fill-current"
				class:fill-primary={number === '+'}
				d="M4.66,41.945l-2.33,0c-1.286,0 -2.33,-1.044 -2.33,-2.33c0,-1.286 1.044,-2.33 2.33,-2.33l1.974,-0l-4.28,-29.965c-0.095,-0.67 0.104,-1.346 0.547,-1.856c0.442,-0.51 1.085,-0.8 1.76,-0.8l25.634,-0l-0,-2.33c-0,-1.287 1.043,-2.33 2.33,-2.33l9.32,-0c1.287,-0 2.33,1.043 2.33,2.33l0,2.33l25.633,-0c0.676,-0 1.32,0.293 1.76,0.803c0.443,0.51 0.64,1.19 0.546,1.856l-4.28,29.965l1.973,-0c1.287,-0 2.33,1.044 2.33,2.33c-0,1.286 -1.044,2.33 -2.33,2.33l-2.33,0l0,2.33c0,1.287 -1.043,2.33 -2.33,2.33l-2.73,-0c0.26,0.73 0.4,1.513 0.4,2.33c-0,3.86 -3.133,6.99 -6.99,6.99c-3.86,0 -6.99,-3.13 -6.99,-6.99c-0,-0.817 0.14,-1.6 0.4,-2.33l-24.1,-0c0.26,0.73 0.4,1.513 0.4,2.33c-0,3.86 -3.133,6.99 -6.99,6.99c-3.86,0 -6.99,-3.13 -6.99,-6.99c0,-0.817 0.14,-1.6 0.4,-2.33l-2.729,-0c-1.287,-0 -2.33,-1.043 -2.33,-2.33l-0,-2.33Z"
			/>
			{#if number === '+'}
				<path
					stroke-width="6"
					stroke-linecap="round"
					class="stroke-primary-content"
					d="M35,14 v20 m-10,-10 h20"
				/>
			{:else if number !== 1}
				<text
					x="50%"
					y="35"
					text-anchor="middle"
					class="fill-base-100 text-3xl font-black"
				>
					{number}
				</text>
			{/if}
		</svg>
	{/each}
</div>
