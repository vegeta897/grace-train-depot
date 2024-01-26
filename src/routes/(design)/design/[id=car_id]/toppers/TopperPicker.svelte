<script lang="ts" context="module">
	export type TopperChoice = { name: TopperName; params?: ParamsObject }
</script>

<script lang="ts">
	import { ContainerSvg, topperDefs } from 'grace-train-lib/components'
	import type { ParamsObject, TopperName } from 'grace-train-lib/data'

	export let onPick: (topper: TopperChoice) => void

	const toppers: TopperChoice[] = [{ name: 'party_hat' }]
</script>

<div class="rounded-box flex items-start gap-2 bg-base-200 p-2 sm:gap-0 sm:p-4">
	<div>
		<h3 class="mb-2 pl-1 text-xl text-base-content/50">add a topper</h3>
		<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(4rem,_1fr))] gap-1">
			{#each toppers as { name, params: defaultParams }}
				{@const topperDef = topperDefs[name]}
				{@const boundingBox = topperDef.getBoundingBox()}
				{@const params = {
					...topperDef.getDefaultParamsObject(),
					...defaultParams,
				}}
				<button
					on:click={() => onPick({ name, params })}
					class="btn btn-ghost aspect-square h-auto min-h-full w-full touch-manipulation p-1"
				>
					<ContainerSvg
						class="max-h-full"
						viewBox="0 0 {boundingBox.width} {boundingBox.height}"
					>
						<svelte:component this={topperDef.component} {params} />
					</ContainerSvg>
				</button>
			{/each}
		</div>
	</div>
</div>
