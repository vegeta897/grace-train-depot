<script lang="ts" context="module">
	export type TopperChoice = { name: TopperName; params?: ParamsObject }
</script>

<script lang="ts">
	import { ContainerSvg, Topper, topperDefs } from 'grace-train-lib/components'
	import type { ParamsObject, TopperName } from 'grace-train-lib/data'

	export let onPick: (topper: TopperChoice) => void

	const toppers: TopperChoice[] = [{ name: 'party_hat' }]
</script>

<div class="rounded-box flex items-start gap-2 bg-base-200 p-2 sm:gap-0 sm:p-4">
	<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(4rem,_1fr))] gap-1">
		{#each toppers as { name, params: defaultParams }}
			{@const params = {
				...topperDefs[name].getDefaultParamsObject(),
				...defaultParams,
			}}
			<!-- {@const boundingBox = decalDefs[name].getBoundingBox(params)} -->
			<button
				on:click={() => onPick({ name, params })}
				class="btn btn-ghost aspect-square h-auto min-h-full w-full touch-manipulation p-1"
			>
				<ContainerSvg viewBox="-80 -120 160 120">
					<!-- <g transform="scale({100 / Math.max(boundingBox.width, boundingBox.height)})"> -->
					<Topper {name} {params} />
					<!-- </g> -->
				</ContainerSvg>
			</button>
		{/each}
	</div>
</div>
