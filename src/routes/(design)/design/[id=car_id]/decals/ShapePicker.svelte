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

	const decalChoices: DecalChoice[] = [
		{ name: 'star', fill: COLORS.POP[4] },
		{ name: 'heart', fill: COLORS.POP[1] },
		{ name: 'circle', fill: COLORS.POP[6] },
		...PRIDE_FLAGS.map(
			(flag) => ({ name: 'flag', defaultParams: { flag } }) as DecalChoice
		),
	]
</script>

<div class="grid grid-cols-6 gap-2">
	{#each decalChoices as { name, fill, defaultParams }}
		{@const params = { ...decalDefs[name].getDefaultParamsObject(), ...defaultParams }}
		<button
			on:click={() => onClick({ name, fill, defaultParams })}
			class="btn-hover-grow btn h-auto w-full touch-manipulation p-2"
		>
			<ContainerSvg viewBox="-50 -50 100 100">
				<Decal {name} fill={fillOverride || fill} {params} />
			</ContainerSvg>
		</button>
	{/each}
</div>
