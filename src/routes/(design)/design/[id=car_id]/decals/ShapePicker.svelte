<script lang="ts" context="module">
	export type DecalChoice = {
		name: DecalName
		fill?: string
		params?: Record<string, any>
	}
	type Tab = {
		name: DecalName
		defaultFill?: string
		defaultParams?: Record<string, any>
	}[]
</script>

<script lang="ts">
	import { COLORS, colorRun } from 'grace-train-lib'
	import {
		Decal,
		decalDefs,
		type DecalName,
		PRIDE_FLAGS,
		ContainerSvg,
	} from 'grace-train-lib/components'

	export let fillOverride: string | undefined = undefined
	export let onClick: (decalProps: DecalChoice) => void
	export let startingShape: DecalName | undefined = 'star' // Unnecessary?

	$: selectedTabIndex = tabs.findIndex((tab) => tab.some((d) => d.name === startingShape))

	const tabs: Tab[] = [
		[
			{ name: 'star', defaultFill: COLORS.POP[4] },
			{ name: 'heart', defaultFill: COLORS.POP[1] },
			{ name: 'circle', defaultFill: COLORS.POP[6] },
		],
		PRIDE_FLAGS.map((flag) => ({ name: 'flag', defaultParams: { flag } }) as DecalChoice),
		[
			{
				name: 'stripes',
				defaultParams: { nodes: [[-90], [0, 1]], colors: colorRun('POP', 1, 3) },
			},
		],
	]
</script>

<div class="rounded-box flex items-start gap-2 bg-base-200 p-2 sm:gap-0 sm:p-4">
	<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(3rem,_1fr))] gap-1">
		{#each tabs[selectedTabIndex] as { name, defaultFill, defaultParams }}
			{@const params = { ...decalDefs[name].getDefaultParamsObject(), ...defaultParams }}
			{@const fill = fillOverride || defaultFill}
			<button
				on:click={() => onClick({ name, fill, params: defaultParams })}
				class="btn btn-ghost aspect-square h-auto min-h-full w-full touch-manipulation p-1"
			>
				<ContainerSvg viewBox="-50 -50 100 100">
					<Decal {name} {fill} {params} />
				</ContainerSvg>
			</button>
		{/each}
	</div>
	<div class="divider divider-horizontal mx-2 hidden sm:flex"></div>
	<div class="join join-vertical">
		{#each tabs as [{ name, defaultFill: fill, defaultParams }], t}
			{@const params = { ...decalDefs[name].getDefaultParamsObject(), ...defaultParams }}
			<button
				on:click={() => (selectedTabIndex = t)}
				class="btn join-item h-14 w-14 px-2 sm:h-16 sm:w-16 sm:px-3"
				class:btn-neutral={t !== selectedTabIndex}
				class:btn-active={t === selectedTabIndex}
				class:btn-primary={t === selectedTabIndex}
			>
				<ContainerSvg viewBox="-50 -50 100 100">
					<Decal {name} {fill} {params} />
				</ContainerSvg>
			</button>
		{/each}
	</div>
</div>
