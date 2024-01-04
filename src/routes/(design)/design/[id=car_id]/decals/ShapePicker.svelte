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
	import { COLOR_NAMES, colorRun } from 'grace-train-lib'
	import {
		Decal,
		decalDefs,
		type DecalName,
		PRIDE_FLAGS,
		ContainerSvg,
	} from 'grace-train-lib/components'

	export let fillOverride: string | undefined = undefined
	export let onPick: (decalProps: DecalChoice) => void
	export let startingShape: DecalName | undefined = 'star' // Unnecessary?

	$: selectedTabIndex = tabs.findIndex((tab) => tab.some((d) => d.name === startingShape))

	const tabs: Tab[] = [
		[
			{ name: 'star', defaultFill: COLOR_NAMES.POP.CANARY },
			{
				name: 'star',
				defaultFill: COLOR_NAMES.POP.RUBY,
				defaultParams: { outline: true, pinch: 0.2, strokeWidth: 0.5 },
			},
			{ name: 'heart', defaultFill: COLOR_NAMES.POP.POP },
			{
				name: 'heart',
				defaultFill: COLOR_NAMES.POP.PIZZAZZ,
				defaultParams: { dip: 0.5, taper: 0.8, outline: true, strokeWidth: 0.6 },
			},
			{ name: 'circle', defaultFill: COLOR_NAMES.POP.SKY },
			{
				name: 'circle',
				defaultFill: COLOR_NAMES.POP.EMERALD,
				defaultParams: { hollow: 0.7 },
			},
			{ name: 'flower' },
			{
				name: 'flower',
				defaultParams: {
					petalColor: COLOR_NAMES.POP.LIME,
					centerColor: COLOR_NAMES.POP.PUMPKIN,
					petals: 8,
					petalBloom: 0.65,
					petalLength: 0.6,
					petalWidth: 0.08,
					centerSize: 0.25,
				},
			},
			{
				name: 'flower',
				defaultParams: {
					petalColor: COLOR_NAMES.POP.POP,
					centerColor: COLOR_NAMES.POP.SKY,
					petals: 5,
					petalBloom: 0.55,
					petalLength: 0,
					petalWidth: 0.45,
				},
			},
		],
		PRIDE_FLAGS.map((flag) => ({ name: 'flag', defaultParams: { flag } }) as DecalChoice),
		[
			{
				name: 'stripes',
				defaultParams: {
					nodes: [[-90], [0, 1]],
					colors: colorRun('POP', 3, 3, 3),
					stripeCount: 3,
				},
			},
		],
	]
</script>

<div class="rounded-box flex items-start gap-2 bg-base-200 p-2 sm:gap-0 sm:p-4">
	<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(3rem,_1fr))] gap-1">
		{#each tabs[selectedTabIndex] as { name, defaultFill, defaultParams }}
			{@const params = {
				...decalDefs[name].getDefaultParamsObject(),
				...defaultParams,
			}}
			{@const fill = fillOverride || defaultFill}
			{@const boundingBox = decalDefs[name].getBoundingBox(params)}
			<button
				on:click={() => onPick({ name, fill, params })}
				class="btn btn-ghost aspect-square h-auto min-h-full w-full touch-manipulation p-1"
			>
				<ContainerSvg viewBox="-50 -50 100 100">
					<g transform="scale({100 / Math.max(boundingBox.width, boundingBox.height)})">
						<Decal {name} {fill} params={{ ...params, extraThickness: 2 }} />
					</g>
				</ContainerSvg>
			</button>
		{/each}
	</div>
	<div class="divider divider-horizontal mx-2 hidden sm:flex"></div>
	<div class="join join-vertical">
		{#each tabs as [{ name, defaultFill: fill, defaultParams }], t}
			{@const params = {
				...decalDefs[name].getDefaultParamsObject(),
				...defaultParams,
				extraThickness: 2,
			}}
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
