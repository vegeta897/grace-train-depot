<script lang="ts" context="module">
	export type DecalChoice = {
		name: DecalName
		fill?: string
		defaultParams?: Record<string, any>
	}
</script>

<script lang="ts">
	import { COLORS } from 'grace-train-lib'
	import {
		Decal,
		decalDefs,
		type DecalName,
		PRIDE_FLAGS,
		ContainerSvg,
	} from 'grace-train-lib/components'

	export let fillOverride: string | undefined = undefined
	export let onClick: (decalProps: DecalChoice) => void

	let selectedTabIndex = 0

	const tabs: DecalChoice[][] = [
		[
			{ name: 'star', fill: COLORS.POP[4] },
			{ name: 'heart', fill: COLORS.POP[1] },
			{ name: 'circle', fill: COLORS.POP[6] },
		],
		PRIDE_FLAGS.map((flag) => ({ name: 'flag', defaultParams: { flag } }) as DecalChoice),
	]
</script>

<!-- TODO: Move tabs inside decal box, vertical on right-hand side -->
<div class="join mb-2">
	{#each tabs as [{ name, fill }], t}
		<button
			on:click={() => (selectedTabIndex = t)}
			class="btn join-item w-16"
			class:btn-active={t === selectedTabIndex}
			class:btn-primary={t === selectedTabIndex}
		>
			<ContainerSvg viewBox="-50 -50 100 100">
				<Decal
					{name}
					fill={fillOverride || fill}
					params={decalDefs[name].getDefaultParamsObject()}
				/>
			</ContainerSvg>
		</button>
	{/each}
</div>
<div class="grid grid-cols-6 gap-1 rounded-lg bg-base-100 p-2">
	{#each tabs[selectedTabIndex] as { name, fill, defaultParams }}
		{@const params = { ...decalDefs[name].getDefaultParamsObject(), ...defaultParams }}
		<button
			on:click={() => onClick({ name, fill, defaultParams })}
			class="btn-hover-grow btn btn-ghost h-auto w-full touch-manipulation p-1"
		>
			<ContainerSvg viewBox="-50 -50 100 100">
				<Decal {name} fill={fillOverride || fill} {params} />
			</ContainerSvg>
		</button>
	{/each}
</div>
