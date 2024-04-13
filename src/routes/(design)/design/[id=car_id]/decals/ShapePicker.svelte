<script lang="ts" context="module">
	import { COLORS, COLOR_NAMES, colorRun } from 'grace-train-lib'
	import {
		Decal,
		decalDefs,
		PRIDE_FLAGS,
		ContainerSvg,
		EMOTES,
	} from 'grace-train-lib/components'
	import type { DecalName, ParamsObject } from 'grace-train-lib/data'
	import { getDecalStores } from './stores'

	export type DecalChoice = {
		name: DecalName
		fill?: string
		params?: ParamsObject
	}
	type Tab = {
		name: DecalName
		defaultFill?: string
		defaultParams?: ParamsObject
	}[]
</script>

<script lang="ts">
	export let onPick: (decalProps: DecalChoice) => void

	const { shapePickerTab } = getDecalStores()

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
			{ name: 'box', defaultFill: COLORS.POP[21] },
			{
				name: 'box',
				defaultFill: COLORS.POP[14],
				defaultParams: { outline: true, round: 0.5, strokeWidth: 0.25 },
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
		EMOTES.map((emote) => ({ name: 'emote', defaultParams: { emote } }) as DecalChoice),
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
		[
			{
				name: 'eyes',
			},
		],
	]
</script>

<div class="rounded-box flex items-start gap-4 bg-base-200 p-2 sm:p-4">
	<div>
		<p class="mb-2 pl-1 text-xl text-base-content/50">pick a decal to add</p>
		<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(3rem,_1fr))] gap-1">
			{#each tabs[$shapePickerTab] as { name, defaultFill: fill, defaultParams }}
				{@const params = {
					...decalDefs[name].getDefaultParamsObject(),
					...defaultParams,
				}}
				{@const boundingBox = decalDefs[name].getBoundingBox(params)}
				<button
					on:click={() => onPick({ name, fill, params })}
					class="btn btn-ghost aspect-square h-auto min-h-full w-full touch-manipulation p-1"
				>
					<ContainerSvg
						class="max-h-full"
						viewBox="{-boundingBox.width / 2} {-boundingBox.height /
							2} {boundingBox.width} {boundingBox.height}"
					>
						<Decal {name} {fill} params={{ ...params, extraThickness: 2 }} />
					</ContainerSvg>
				</button>
			{/each}
		</div>
	</div>
	<div class="join join-vertical">
		{#each tabs as [{ name, defaultFill: fill, defaultParams }], t}
			{@const params = {
				...decalDefs[name].getDefaultParamsObject(),
				...defaultParams,
				extraThickness: 2,
			}}
			<button
				on:click={() => shapePickerTab.set(t)}
				class="btn join-item size-14 px-2 sm:size-16 sm:px-3"
				class:btn-neutral={t !== $shapePickerTab}
				class:btn-active={t === $shapePickerTab}
				class:btn-secondary={t === $shapePickerTab}
			>
				<ContainerSvg viewBox="-50 -50 100 100">
					<Decal {name} {fill} {params} />
				</ContainerSvg>
			</button>
		{/each}
	</div>
</div>
